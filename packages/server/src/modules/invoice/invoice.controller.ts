import { Controller, Get, Post, Body } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@open-trade/shared';
import { InvoiceType } from '@prisma/client';

@Controller('invoice')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: { orderId: string; type: InvoiceType; title: string; taxNumber?: string }) {
    return this.invoiceService.create(user.userId, dto);
  }

  @Get()
  findByUser(@CurrentUser() user: JwtPayload) {
    return this.invoiceService.findByUser(user.userId);
  }
}
