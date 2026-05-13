import { Controller, Get, Post, Body } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { PriceQueryDto } from './dto/vehicle.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('vehicle')
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Public()
  @Get('types')
  getTypes() {
    return this.vehicleService.getTypes();
  }

  @Public()
  @Get('pricing')
  getPricing() {
    return this.vehicleService.getPricingRules();
  }

  @Public()
  @Post('price')
  calculatePrice(@Body() dto: PriceQueryDto) {
    return this.vehicleService.calculatePrice(dto);
  }
}
