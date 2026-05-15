import { Controller, Get, Put, Param, Query, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '@open-trade/shared';

@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('drivers')
  getAllDrivers() {
    return this.adminService.getAllDrivers();
  }

  @Get('drivers/pending')
  getPendingDrivers() {
    return this.adminService.getPendingDrivers();
  }

  @Put('drivers/:id/review')
  reviewDriver(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; remark?: string },
  ) {
    return this.adminService.reviewDriver(id, body.action, body.remark);
  }

  @Get('orders')
  getOrders(
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.adminService.getOrders({ status, page: +page, pageSize: +pageSize });
  }

  @Put('orders/:id/cancel')
  cancelOrder(@Param('id') id: string) {
    return this.adminService.cancelOrder(id);
  }

  @Put('orders/:id/complete')
  completeOrder(@Param('id') id: string) {
    return this.adminService.completeOrder(id);
  }

  @Get('statistics/dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('complaints')
  getComplaints() {
    return this.adminService.getComplaints();
  }

  @Put('complaints/:id/resolve')
  resolveComplaint(
    @Param('id') id: string,
    @Body() body: { resolution: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.adminService.resolveComplaint(id, body.resolution, user.userId);
  }

  @Put('complaints/:id/dismiss')
  dismissComplaint(
    @Param('id') id: string,
    @Body() body: { resolution?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.adminService.dismissComplaint(id, body.resolution, user.userId);
  }

  @Get('pricing')
  getPricingRules() {
    return this.adminService.getPricingRules();
  }

  @Put('pricing/:id')
  updatePricing(
    @Param('id') id: string,
    @Body() body: { basePrice?: number; pricePerKm?: number; includedKm?: number },
  ) {
    return this.adminService.updatePricing(id, body);
  }
}
