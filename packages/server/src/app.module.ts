import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DriverModule } from './modules/driver/driver.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AdminModule } from './modules/admin/admin.module';
import { SmsModule } from './modules/sms/sms.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { ReviewModule } from './modules/review/review.module';
import { ComplaintModule } from './modules/complaint/complaint.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { PointsModule } from './modules/points/points.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { SettlementModule } from './modules/settlement/settlement.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    DriverModule,
    VehicleModule,
    OrderModule,
    PaymentModule,
    AdminModule,
    SmsModule,
    ReviewModule,
    ComplaintModule,
    WalletModule,
    FeedbackModule,
    CouponModule,
    PointsModule,
    InvoiceModule,
    SettlementModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    Reflector,
  ],
})
export class AppModule {}
