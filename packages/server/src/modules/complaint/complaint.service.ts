import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateComplaintDto } from './dto/complaint.dto';
import { COMPLAINABLE_STATUSES, OrderStatus } from '@open-trade/shared';

@Injectable()
export class ComplaintService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateComplaintDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) throw new NotFoundException('订单不存在');
    if (order.userId !== userId) throw new BadRequestException('无权投诉此订单');
    if (!COMPLAINABLE_STATUSES.includes(order.status as OrderStatus)) {
      throw new BadRequestException('当前订单状态不可投诉');
    }

    const [complaint] = await this.prisma.$transaction([
      this.prisma.complaint.create({
        data: {
          orderId: dto.orderId,
          complainantId: userId,
          type: dto.type,
          content: dto.content,
        },
      }),
      this.prisma.order.updateMany({
        where: { id: dto.orderId, status: { not: OrderStatus.DISPUTED } },
        data: { status: OrderStatus.DISPUTED },
      }),
    ]);

    return complaint;
  }

  async findMyComplaints(userId: string) {
    return this.prisma.complaint.findMany({
      where: { complainantId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { orderNo: true, status: true } },
      },
    });
  }
}
