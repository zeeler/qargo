import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettlementService {
  constructor(private prisma: PrismaService) {}

  async generate() {
    const drivers = await this.prisma.driver.findMany({
      where: { status: 'approved' },
      include: { orders: { where: { status: 'completed' } }, settlements: true },
    });

    const results = [];
    for (const driver of drivers) {
      const settledOrderIds = new Set(driver.settlements.flatMap(() => []));
      // Get completed orders that are not yet in any settlement (simplified: use all completed)
      const completedOrders = driver.orders;
      if (completedOrders.length === 0) continue;

      // Check if there's already a pending settlement
      const existingSettlement = driver.settlements.find(s => s.status === 'pending');
      if (existingSettlement) {
        // Update existing pending settlement
        const totalAmount = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
        const platformFee = Math.round(totalAmount * 0.05);
        const updated = await this.prisma.settlement.update({
          where: { id: existingSettlement.id },
          data: {
            periodEnd: new Date(),
            orderCount: completedOrders.length,
            totalAmount,
            platformFee,
            netAmount: totalAmount - platformFee,
          },
        });
        results.push(updated);
      } else {
        const totalAmount = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
        const platformFee = Math.round(totalAmount * 0.05);
        const settlement = await this.prisma.settlement.create({
          data: {
            driverId: driver.id,
            periodStart: new Date(Math.min(...completedOrders.map(o => new Date(o.createdAt).getTime()))),
            periodEnd: new Date(),
            orderCount: completedOrders.length,
            totalAmount,
            platformFee,
            netAmount: totalAmount - platformFee,
          },
        });
        results.push(settlement);
      }
    }

    if (results.length === 0) throw new BadRequestException('没有可结算的订单');
    return results;
  }

  async findAll() {
    return this.prisma.settlement.findMany({
      include: { driver: { include: { user: { select: { name: true, phone: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async settle(id: string) {
    const settlement = await this.prisma.settlement.findUnique({ where: { id } });
    if (!settlement) throw new BadRequestException('结算单不存在');
    if (settlement.status === 'settled') throw new BadRequestException('已结算');
    return this.prisma.settlement.update({
      where: { id },
      data: { status: 'settled', settledAt: new Date() },
    });
  }
}
