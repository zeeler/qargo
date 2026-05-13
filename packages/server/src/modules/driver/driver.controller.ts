import { Controller, Post, Get, Put, Body } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverRegisterDto, UpdateLocationDto } from './dto/driver.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@open-trade/shared';

@Controller('driver')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Post('register')
  register(@CurrentUser() user: JwtPayload, @Body() dto: DriverRegisterDto) {
    return this.driverService.register(user.userId, dto);
  }

  @Get('status')
  getStatus(@CurrentUser() user: JwtPayload) {
    return this.driverService.getStatus(user.userId);
  }

  @Put('location')
  updateLocation(@CurrentUser() user: JwtPayload, @Body() dto: UpdateLocationDto) {
    return this.driverService.updateLocation(user.userId, dto);
  }
}
