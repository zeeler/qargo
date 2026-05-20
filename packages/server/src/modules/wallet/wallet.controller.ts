import { Controller, Get, Post, Body } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TopupDto } from './dto/wallet.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@open-trade/shared';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  getWallet(@CurrentUser() user: JwtPayload) {
    return this.walletService.getOrCreateWallet(user.userId);
  }

  @Get('transactions')
  getTransactions(@CurrentUser() user: JwtPayload) {
    return this.walletService.getTransactions(user.userId);
  }

  @Post('topup')
  topup(@CurrentUser() user: JwtPayload, @Body() dto: TopupDto) {
    return this.walletService.topup(user.userId, dto);
  }
}
