import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TopupDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({ data: { userId, balance: 0 } });
    }
    return wallet;
  }

  async getTransactions(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async topup(userId: string, dto: TopupDto) {
    const wallet = await this.getOrCreateWallet(userId);
    const balanceBefore = Number(wallet.balance);
    const balanceAfter = balanceBefore + dto.amount;

    const [transaction] = await this.prisma.$transaction([
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'topup',
          amount: dto.amount,
          balanceBefore,
          balanceAfter,
        },
      }),
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      }),
    ]);

    return { balance: balanceAfter, transaction };
  }
}
