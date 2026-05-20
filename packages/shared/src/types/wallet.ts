export interface WalletVo {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
}

export interface WalletTransactionVo {
  id: string;
  walletId: string;
  type: 'topup' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}
