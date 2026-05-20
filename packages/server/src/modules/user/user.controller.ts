import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@open-trade/shared';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user.userId);
  }

  @Put('profile')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.userId, dto);
  }

  @Get('addresses')
  getAddresses(@CurrentUser() user: JwtPayload) {
    return this.userService.getAddresses(user.userId);
  }

  @Post('addresses')
  createAddress(@CurrentUser() user: JwtPayload, @Body() dto: CreateAddressDto) {
    return this.userService.createAddress(user.userId, dto);
  }

  @Delete('addresses/:id')
  deleteAddress(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.userService.deleteAddress(user.userId, id);
  }

  @Put('addresses/:id')
  updateAddress(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.userService.updateAddress(user.userId, id, dto);
  }
}
