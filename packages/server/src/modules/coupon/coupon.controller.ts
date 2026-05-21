import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto, RedeemCouponDto } from './dto/coupon.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '@open-trade/shared';

@Controller('coupon')
export class CouponController {
  constructor(private couponService: CouponService) {}

  // User endpoints
  @Post('redeem')
  redeem(@CurrentUser() user: JwtPayload, @Body() dto: RedeemCouponDto) {
    return this.couponService.redeem(user.userId, dto);
  }

  @Get('my')
  myCoupons(@CurrentUser() user: JwtPayload) {
    return this.couponService.myCoupons(user.userId);
  }

  // Admin endpoints
  @Post()
  @Roles('admin')
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.couponService.findAll();
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.couponService.delete(id);
  }
}
