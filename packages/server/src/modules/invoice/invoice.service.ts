import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceType } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: { orderId: string; type: InvoiceType; title: string; taxNumber?: string }) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.userId !== userId) throw new BadRequestException('无权操作');
    if (order.status !== 'completed') throw new BadRequestException('仅可对已完成订单申请开票');

    const existing = await this.prisma.invoice.findUnique({ where: { orderId: dto.orderId } });
    if (existing) throw new BadRequestException('该订单已申请过发票');

    const invoiceNo = `INV${Date.now().toString(36).toUpperCase()}`;
    return this.prisma.invoice.create({
      data: {
        userId,
        orderId: dto.orderId,
        type: dto.type,
        title: dto.title,
        taxNumber: dto.taxNumber,
        amount: order.totalPrice,
        invoiceNo,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      include: { order: { select: { orderNo: true, totalPrice: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
