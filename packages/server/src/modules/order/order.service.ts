import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VehicleService } from '../vehicle/vehicle.service';
import { CouponService } from '../coupon/coupon.service';
import { PointsService } from '../points/points.service';
import { CreateOrderDto, NearbyOrderQueryDto } from './dto/order.dto';
import { NEARBY_ORDER_RADIUS_KM } from '@open-trade/shared';

function generateOrderNo(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OT${dateStr}${rand}`;
}

type OrderStatusValue = 'pending' | 'paid' | 'dispatched' | 'arrived' | 'loading' | 'delivering' | 'completed' | 'cancelled' | 'disputed';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private vehicleService: VehicleService,
    private couponService: CouponService,
    private pointsService: PointsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const price = await this.vehicleService.calculatePrice({
      vehicleTypeCode: dto.vehicleTypeCode,
      pickupLng: dto.pickupLng,
      pickupLat: dto.pickupLat,
      dropoffLng: dto.dropoffLng,
      dropoffLat: dto.dropoffLat,
      userAdditionalFee: dto.userAdditionalFee,
    });

    let couponDiscount = 0;
    let userCouponId: string | null = null;

    if (dto.couponCode) {
      const { userCoupon, coupon } = await this.couponService.applyCoupon(userId, dto.couponCode);
      if (Number(coupon.minOrderAmount) > 0 && price.totalPrice < Number(coupon.minOrderAmount)) {
        throw new BadRequestException(`订单金额需满¥${Number(coupon.minOrderAmount)}才能使用该优惠券`);
      }
      if (coupon.type === 'fixed') {
        couponDiscount = Math.min(Number(coupon.value), price.totalPrice);
      } else {
        couponDiscount = Math.round(price.totalPrice * (1 - Number(coupon.value)) * 100) / 100;
      }
      userCouponId = userCoupon.id;
    }

    const totalPrice = Math.round(price.totalPrice - couponDiscount);

    const order = await this.prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        userId,
        vehicleTypeCode: dto.vehicleTypeCode,
        status: 'pending',
        pickupAddress: dto.pickupAddress,
        pickupLng: dto.pickupLng,
        pickupLat: dto.pickupLat,
        pickupContactName: dto.pickupContactName,
        pickupContactPhone: dto.pickupContactPhone,
        dropoffAddress: dto.dropoffAddress,
        dropoffLng: dto.dropoffLng,
        dropoffLat: dto.dropoffLat,
        dropoffContactName: dto.dropoffContactName,
        dropoffContactPhone: dto.dropoffContactPhone,
        distanceKm: price.distanceKm,
        basePrice: price.basePrice,
        distancePrice: price.distancePrice,
        surgeFee: price.surgeFee,
        userAdditionalFee: price.userAdditionalFee,
        totalPrice,
        cargoPhotos: [],
        remark: dto.remark || '',
      },
    });

    if (userCouponId) {
      await this.couponService.markUsed(userCouponId, order.id);
    }

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        amount: totalPrice,
        method: dto.paymentMethod,
        platformFee: Math.round(totalPrice * 0.05),
      },
    });

    return order;
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        driver: { include: { vehicle: true, user: { select: { name: true, phone: true } } } },
        payment: true,
        tracks: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('订单不存在');
    return order;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { driver: { include: { vehicle: true } }, payment: true },
    });
  }

  async getDriverOrders(userId: string) {
    const driver = await this.prisma.driver.findUnique({ where: { userId } });
    if (!driver) throw new ForbiddenException('您不是司机');
    return this.prisma.order.findMany({
      where: { driverId: driver.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, phone: true } }, payment: true },
    });
  }

  async pay(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.userId !== userId) throw new ForbiddenException('无权操作');
    if (order.status !== 'pending') throw new BadRequestException('订单状态不正确');

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid', paidAt: new Date() },
    });

    await this.prisma.payment.update({
      where: { orderId },
      data: { status: 'success', paidAt: new Date() },
    });

    await this.pointsService.earnPoints(userId, order.totalPrice);

    return { message: '支付成功' };
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.userId !== userId) throw new ForbiddenException('无权操作');
    if (!['pending', 'paid'].includes(order.status)) {
      throw new BadRequestException('当前状态无法取消');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });
    return { message: '订单已取消' };
  }

  async getNearbyOrders(dto: NearbyOrderQueryDto) {
    const { lng, lat, radiusKm } = dto;
    const maxRadius = radiusKm || 10;

    const paidOrders = await this.prisma.order.findMany({
      where: { status: 'paid' },
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return paidOrders
      .filter((order) => {
        const dist = this.haversineDistance(lat, lng, order.pickupLat, order.pickupLng);
        return dist <= maxRadius;
      })
      .slice(0, 20);
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  async dispatch(driverUserId: string, orderId: string) {
    const driver = await this.prisma.driver.findUnique({ where: { userId: driverUserId } });
    if (!driver) throw new ForbiddenException('您不是司机');
    if (driver.status !== 'approved') throw new BadRequestException('司机账号未通过审核');

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== 'paid') throw new BadRequestException('订单状态不正确');

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'dispatched', driverId: driver.id, dispatchedAt: new Date() },
    });

    await this.prisma.payment.update({
      where: { orderId },
      data: { driverId: driver.id, driverIncome: Math.round(order.totalPrice * 0.95) },
    });

    return { message: '接单成功' };
  }

  async arrive(driverUserId: string, orderId: string) {
    await this.verifyDriverOrder(driverUserId, orderId, ['dispatched']);
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'arrived', arrivedAt: new Date() },
    });
  }

  async uploadPhoto(driverUserId: string, orderId: string, photoUrl: string) {
    const order = await this.verifyDriverOrder(driverUserId, orderId, ['arrived', 'loading']);

    const photos = [...order.cargoPhotos, photoUrl];
    await this.prisma.order.update({
      where: { id: orderId },
      data: { cargoPhotos: photos, status: 'loading' },
    });
    return { message: '照片上传成功', photos };
  }

  async complete(driverUserId: string, orderId: string) {
    await this.verifyDriverOrder(driverUserId, orderId, ['delivering']);
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  async depart(driverUserId: string, orderId: string) {
    await this.verifyDriverOrder(driverUserId, orderId, ['loading']);
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'delivering' },
    });
  }

  private async verifyDriverOrder(driverUserId: string, orderId: string, allowedStatuses: string[]) {
    const driver = await this.prisma.driver.findUnique({ where: { userId: driverUserId } });
    if (!driver) throw new ForbiddenException('您不是司机');

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.driverId !== driver.id) throw new ForbiddenException('这不是您的订单');
    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException('订单状态不正确');
    }
    return order;
  }
}
