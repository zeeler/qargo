import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto, RedeemCouponDto } from './dto/coupon.dto';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  // -- Admin --

  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException('优惠券码已存在');
    return this.prisma.coupon.create({
      data: {
        code: dto.code,
        type: dto.type,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount ?? 0,
        validFrom: new Date(dto.validFrom),
        validUntil: new Date(dto.validUntil),
        usageLimit: dto.usageLimit ?? 100,
      },
    });
  }

  async findAll() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async delete(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }

  // -- User --

  async redeem(userId: string, dto: RedeemCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.code } });
    if (!coupon) throw new NotFoundException('优惠券不存在');
    if (coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('优惠券已领完');
    if (new Date() < coupon.validFrom) throw new BadRequestException('优惠券尚未生效');
    if (new Date() > coupon.validUntil) throw new BadRequestException('优惠券已过期');

    const existing = await this.prisma.userCoupon.findFirst({
      where: { userId, couponId: coupon.id },
    });
    if (existing) throw new BadRequestException('您已领取过该优惠券');

    const [userCoupon] = await this.prisma.$transaction([
      this.prisma.userCoupon.create({ data: { userId, couponId: coupon.id } }),
      this.prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } }),
    ]);

    return userCoupon;
  }

  async myCoupons(userId: string) {
    return this.prisma.userCoupon.findMany({
      where: { userId },
      include: { coupon: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyCoupon(userId: string, code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException('优惠券不存在');
    if (new Date() < coupon.validFrom) throw new BadRequestException('优惠券尚未生效');
    if (new Date() > coupon.validUntil) throw new BadRequestException('优惠券已过期');

    const userCoupon = await this.prisma.userCoupon.findFirst({
      where: { userId, couponId: coupon.id, status: 'unused' },
    });
    if (!userCoupon) throw new BadRequestException('您未拥有该优惠券或已使用');

    return { userCoupon, coupon };
  }

  async markUsed(userCouponId: string, orderId: string) {
    return this.prisma.userCoupon.update({
      where: { id: userCouponId },
      data: { status: 'used', usedAt: new Date(), orderId },
    });
  }
}
