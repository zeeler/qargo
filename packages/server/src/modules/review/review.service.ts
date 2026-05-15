import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';
import { OrderStatus } from '@open-trade/shared';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) throw new NotFoundException('订单不存在');
    if (order.userId !== userId) throw new BadRequestException('无权评价此订单');
    if (order.status !== OrderStatus.COMPLETED) throw new BadRequestException('仅可评价已完成的订单');
    if (!order.driverId) throw new BadRequestException('订单无司机信息');

    try {
      return await this.prisma.review.create({
        data: {
          orderId: dto.orderId,
          userId,
          driverId: order.driverId,
          rating: dto.rating,
          content: dto.content,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new BadRequestException('该订单已评价');
      throw e;
    }
  }

  async findByOrder(orderId: string) {
    return this.prisma.review.findUnique({
      where: { orderId },
      include: {
        user: { select: { name: true } },
      },
    });
  }

  async findByDriver(driverId: string) {
    return this.prisma.review.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        order: { select: { orderNo: true } },
      },
    });
  }
}
