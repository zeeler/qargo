import { Controller, Get, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get(':orderId')
  getPayment(@Param('orderId') orderId: string) {
    return this.paymentService.getPayment(orderId);
  }
}
