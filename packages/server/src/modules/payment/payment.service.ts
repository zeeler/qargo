import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getPayment(orderId: string) {
    return this.prisma.payment.findUnique({ where: { orderId } });
  }

  // Mock 支付回调
  async mockNotify(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new Error('支付记录不存在');

    return this.prisma.payment.update({
      where: { orderId },
      data: { status: 'success', paidAt: new Date() },
    });
  }
}
