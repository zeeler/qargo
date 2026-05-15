import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ComplaintStatus } from '@open-trade/shared';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingDrivers() {
    return this.prisma.driver.findMany({
      where: { status: 'pending' },
      include: { user: { select: { id: true, phone: true, name: true } }, vehicle: true },
    });
  }

  async getAllDrivers() {
    return this.prisma.driver.findMany({
      include: { user: { select: { id: true, phone: true, name: true } }, vehicle: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewDriver(driverId: string, action: 'approve' | 'reject', remark?: string) {
    const status = action === 'approve' ? 'approved' : 'rejected';
    return this.prisma.driver.update({
      where: { id: driverId },
      data: { status, remark },
    });
  }

  async getOrders(params: { status?: string; page: number; pageSize: number }) {
    const where: any = params.status ? { status: params.status } : {};
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, phone: true } }, driver: { include: { user: true } } },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  async getDashboardStats() {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalDrivers,
      pendingDrivers,
      totalRevenue,
      totalComplaints,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'pending' } }),
      this.prisma.order.count({ where: { status: 'completed' } }),
      this.prisma.driver.count(),
      this.prisma.driver.count({ where: { status: 'pending' } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'success' } }),
      this.prisma.complaint.count({ where: { status: 'pending' } }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalDrivers,
      pendingDrivers,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalComplaints,
    };
  }

  async getComplaints() {
    return this.prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: { order: true, user: { select: { name: true, phone: true } } },
    });
  }

  async resolveComplaint(complaintId: string, resolution: string, adminUserId: string) {
    return this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: ComplaintStatus.RESOLVED, resolution, adminId: adminUserId },
    });
  }

  async dismissComplaint(complaintId: string, resolution: string | undefined, adminUserId: string) {
    return this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: ComplaintStatus.DISMISSED, resolution: resolution || null, adminId: adminUserId },
    });
  }

  async cancelOrder(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });
  }

  async completeOrder(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  async getPricingRules() {
    return this.prisma.pricingRule.findMany({ orderBy: { vehicleTypeCode: 'asc' } });
  }

  async updatePricing(id: string, data: { basePrice?: number; pricePerKm?: number; includedKm?: number }) {
    return this.prisma.pricingRule.update({ where: { id }, data });
  }
}
