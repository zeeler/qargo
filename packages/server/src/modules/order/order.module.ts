import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { VehicleModule } from '../vehicle/vehicle.module';
import { CouponModule } from '../coupon/coupon.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [VehicleModule, CouponModule, PointsModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
