import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, NearbyOrderQueryDto, UploadPhotoDto } from './dto/order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@open-trade/shared';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('create')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user.userId, dto);
  }

  @Get('list')
  getUserOrders(@CurrentUser() user: JwtPayload) {
    return this.orderService.getUserOrders(user.userId);
  }

  @Get('driver/list')
  getDriverOrders(@CurrentUser() user: JwtPayload) {
    return this.orderService.getDriverOrders(user.userId);
  }

  @Get(':id')
  getOrder(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orderService.getOrder(user.userId, id);
  }

  @Put(':id/pay')
  pay(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orderService.pay(user.userId, id);
  }

  @Put(':id/cancel')
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orderService.cancel(user.userId, id);
  }

  @Post('nearby')
  getNearbyOrders(@Body() dto: NearbyOrderQueryDto) {
    return this.orderService.getNearbyOrders(dto);
  }

  @Put(':id/dispatch')
  dispatch(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orderService.dispatch(user.userId, id);
  }

  @Put(':id/arrive')
  arrive(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orderService.arrive(user.userId, id);
  }

  @Put(':id/photo')
  uploadPhoto(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UploadPhotoDto) {
    return this.orderService.uploadPhoto(user.userId, id, dto.photoUrl);
  }

  @Put(':id/complete')
  complete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orderService.complete(user.userId, id);
  }

  @Put(':id/depart')
  depart(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orderService.depart(user.userId, id);
  }
}
