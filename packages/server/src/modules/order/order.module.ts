import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { VehicleModule } from '../vehicle/vehicle.module';

@Module({
  imports: [VehicleModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
