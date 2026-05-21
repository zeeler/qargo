import { Controller, Get, Post, Body } from '@nestjs/common';
import { PointsService } from './points.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@open-trade/shared';

@Controller('points')
export class PointsController {
  constructor(private pointsService: PointsService) {}

  @Get()
  getPoints(@CurrentUser() user: JwtPayload) {
    return this.pointsService.getOrCreate(user.userId);
  }

  @Get('transactions')
  getTransactions(@CurrentUser() user: JwtPayload) {
    return this.pointsService.getTransactions(user.userId);
  }

  @Get('rules')
  getRedeemRules() {
    return this.pointsService.getRedeemRules();
  }

  @Post('redeem')
  redeem(@CurrentUser() user: JwtPayload, @Body('points') points: number) {
    return this.pointsService.redeem(user.userId, points);
  }
}
