import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // <-- ../../prisma
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library'; // <-- correct path
import { AccountCode } from '../constants/account-codes'; // <-- ../../constants
import { FinanceService } from '../finance.service';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private finance: FinanceService,
  ) {}

  /** Get existing wallet or create new one with zero balance */
  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: new Decimal(0),
          currency: 'NGN',
          isActive: true,
        },
      });
    }
    return wallet;
  }

  /** Get current wallet balance */
  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return { balance: wallet.balance, currency: wallet.currency };
  }

  /** Top up wallet — adds funds, posts to ledger */
  async topup(params: {
    userId: string;
    amount: Decimal;
    reference: string;
    description?: string;
    metadata?: Prisma.JsonValue;
  }) {
    const { userId, amount, reference, description, metadata } = params;
    if (amount.lte(0))
      throw new BadRequestException('Topup amount must be positive');

    return this.prisma.$transaction(
      async (tx) => {
        // 1. Increment wallet balance
        const wallet = await tx.wallet.update({
          where: { userId },
          data: { balance: { increment: amount } },
        });

        // 2. Record wallet transaction
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'TOPUP',
            amount,
            balanceAfter: wallet.balance,
            reference,
            description: description ?? 'Wallet top-up',
            metadata: metadata ?? undefined,
          },
        });

        // 3. Ledger: Asset DR (1200), Liability CR (2200)
        await this.finance.postTransaction({
          reference: `WALLET_TOPUP_${reference}`,
          type: 'TRANSFER',
          description: `Wallet top-up for user ${userId}`,
          idempotencyKey: `wallet_topup_${reference}`,
          lines: [
            {
              accountCode: AccountCode.CUSTOMER_WALLET_ASSET,
              debit: amount,
              memo: `Top-up ${reference}`,
            },
            {
              accountCode: AccountCode.CUSTOMER_WALLET_LIABILITY,
              credit: amount,
              memo: `Liability ${reference}`,
            },
          ],
        });

        return { wallet, balance: wallet.balance };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /** Pay from wallet — deducts funds, posts to ledger */
  async payFromWallet(params: {
    userId: string;
    amount: Decimal;
    reference: string;
    description?: string;
    metadata?: Prisma.JsonValue;
  }) {
    const { userId, amount, reference, description, metadata } = params;
    if (amount.lte(0))
      throw new BadRequestException('Payment amount must be positive');

    return this.prisma.$transaction(
      async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new NotFoundException('Wallet not found');
        if (!wallet.isActive)
          throw new BadRequestException('Wallet is inactive');
        if (wallet.balance.lt(amount))
          throw new BadRequestException('Insufficient wallet balance');

        // 1. Decrement balance
        const updated = await tx.wallet.update({
          where: { userId },
          data: { balance: { decrement: amount } },
        });

        // 2. Record transaction
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'PAYMENT',
            amount,
            balanceAfter: updated.balance,
            reference,
            description: description ?? 'Wallet payment',
            metadata: metadata ?? undefined,
          },
        });

        // 3. Ledger: Liability DR (2200), Asset CR (1200) — reverse of topup
        await this.finance.postTransaction({
          reference: `WALLET_PAY_${reference}`,
          type: 'TRANSFER',
          description: `Wallet payment by user ${userId}`,
          idempotencyKey: `wallet_pay_${reference}`,
          lines: [
            {
              accountCode: AccountCode.CUSTOMER_WALLET_LIABILITY,
              debit: amount,
              memo: `Payment ${reference}`,
            },
            {
              accountCode: AccountCode.CUSTOMER_WALLET_ASSET,
              credit: amount,
              memo: `Asset reduction ${reference}`,
            },
          ],
        });

        return { wallet: updated, balance: updated.balance };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /** Refund to wallet — adds funds (same ledger as topup) */
  async refundToWallet(params: {
    userId: string;
    amount: Decimal;
    reference: string;
    description?: string;
    metadata?: Prisma.JsonValue;
  }) {
    const { userId, amount, reference, description, metadata } = params;
    if (amount.lte(0))
      throw new BadRequestException('Refund amount must be positive');

    return this.prisma.$transaction(
      async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new NotFoundException('Wallet not found');

        const updated = await tx.wallet.update({
          where: { userId },
          data: { balance: { increment: amount } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'REFUND',
            amount,
            balanceAfter: updated.balance,
            reference,
            description: description ?? 'Refund to wallet',
            metadata: metadata ?? undefined,
          },
        });

        // Ledger: Same as topup (Asset DR, Liability CR)
        await this.finance.postTransaction({
          reference: `WALLET_REFUND_${reference}`,
          type: 'TRANSFER',
          description: `Refund to wallet for user ${userId}`,
          idempotencyKey: `wallet_refund_${reference}`,
          lines: [
            {
              accountCode: AccountCode.CUSTOMER_WALLET_ASSET,
              debit: amount,
              memo: `Refund ${reference}`,
            },
            {
              accountCode: AccountCode.CUSTOMER_WALLET_LIABILITY,
              credit: amount,
              memo: `Liability ${reference}`,
            },
          ],
        });

        return { wallet: updated, balance: updated.balance };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /** Paginated transaction history */
  async getTransactions(userId: string, page = 1, limit = 20) {
    const wallet = await this.getOrCreateWallet(userId);
    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);
    return {
      data: transactions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
