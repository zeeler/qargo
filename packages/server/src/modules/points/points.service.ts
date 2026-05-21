import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const REDEEM_RULES = [
  { points: 100, couponType: 'fixed' as const, couponValue: 5, minOrderAmount: 0 },
  { points: 200, couponType: 'fixed' as const, couponValue: 12, minOrderAmount: 0 },
  { points: 500, couponType: 'fixed' as const, couponValue: 35, minOrderAmount: 0 },
];

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    let points = await this.prisma.userPoints.findUnique({ where: { userId } });
    if (!points) {
      points = await this.prisma.userPoints.create({ data: { userId, balance: 0 } });
    }
    return points;
  }

  async getTransactions(userId: string) {
    return this.prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async earnPoints(userId: string, amount: number) {
    const points = await this.getOrCreate(userId);
    const balanceBefore = points.balance;
    const balanceAfter = balanceBefore + amount;

    await this.prisma.$transaction([
      this.prisma.pointTransaction.create({
        data: { pointId: points.id, userId, type: 'earn', amount, balanceBefore, balanceAfter },
      }),
      this.prisma.userPoints.update({ where: { id: points.id }, data: { balance: balanceAfter } }),
    ]);
  }

  getRedeemRules() {
    return REDEEM_RULES;
  }

  async redeem(userId: string, pointsToRedeem: number) {
    const rule = REDEEM_RULES.find(r => r.points === pointsToRedeem);
    if (!rule) throw new BadRequestException('无效的兑换选项');

    const points = await this.getOrCreate(userId);
    if (points.balance < pointsToRedeem) throw new BadRequestException('积分不足');

    const balanceBefore = points.balance;
    const balanceAfter = balanceBefore - pointsToRedeem;

    // Create coupon
    const code = `POINTS${Date.now().toString(36).toUpperCase()}`;
    const coupon = await this.prisma.$transaction(async (tx) => {
      const c = await tx.coupon.create({
        data: {
          code,
          type: rule.couponType,
          value: rule.couponValue,
          minOrderAmount: rule.minOrderAmount,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          usageLimit: 1,
        },
      });
      await tx.userCoupon.create({ data: { userId, couponId: c.id } });
      // Also update usedCount on coupon since usageLimit is 1
      await tx.coupon.update({ where: { id: c.id }, data: { usedCount: 1 } });
      return c;
    });

    await this.prisma.$transaction([
      this.prisma.pointTransaction.create({
        data: { pointId: points.id, userId, type: 'redeem', amount: pointsToRedeem, balanceBefore, balanceAfter },
      }),
      this.prisma.userPoints.update({ where: { id: points.id }, data: { balance: balanceAfter } }),
    ]);

    return { balance: balanceAfter, coupon };
  }
}
