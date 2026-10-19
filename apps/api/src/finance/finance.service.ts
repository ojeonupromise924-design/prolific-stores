import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AccountCode } from './constants/account-codes';

// Estimate only. Real gateway fees should come from Paystack settlement
// data once reconciliation exists.
const GATEWAY_FEE_RATE = new Decimal('0.015');

type LedgerLine = {
  accountCode: string;
  debit?: Decimal | number | string;
  credit?: Decimal | number | string;
  memo?: string;
};

interface PostTransactionParams {
  reference: string;
  type: 'PAYMENT_CAPTURE' | 'TRANSFER' | 'ADJUSTMENT' | 'REVERSAL';
  description?: string;
  orderId?: string;
  idempotencyKey?: string;
  createdByUserId?: string;
  lines: LedgerLine[];
}

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  private accountIdCache = new Map<string, string>();
  private async getAccountId(code: string): Promise<string> {
    if (this.accountIdCache.has(code)) return this.accountIdCache.get(code)!;
    const acc = await this.prisma.financialAccount.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!acc) {
      throw new BadRequestException(
        `Ledger account ${code} is missing. Run the chart-of-accounts seed.`,
      );
    }
    this.accountIdCache.set(code, acc.id);
    return acc.id;
  }

  /**
   * Pass `tx` to post inside the caller's transaction (so the ledger entry
   * commits or rolls back with the rest of the work). Without `tx`, it opens
   * its own serializable transaction, as before.
   */
  async postTransaction(
    params: PostTransactionParams,
    tx?: Prisma.TransactionClient,
  ) {
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    for (const line of params.lines) {
      const debit = new Decimal(line.debit ?? 0);
      const credit = new Decimal(line.credit ?? 0);
      if (debit.isNegative() || credit.isNegative()) {
        throw new BadRequestException('Ledger amounts cannot be negative');
      }
      totalDebit = totalDebit.plus(debit);
      totalCredit = totalCredit.plus(credit);
    }

    if (!totalDebit.equals(totalCredit)) {
      throw new BadRequestException(
        `Unbalanced: debits ${totalDebit.toString()} ≠ credits ${totalCredit.toString()}`,
      );
    }

    const write = async (client: Prisma.TransactionClient) =>
      client.financialTransaction.create({
        data: {
          reference: params.reference,
          type: params.type,
          description: params.description,
          orderId: params.orderId,
          idempotencyKey: params.idempotencyKey,
          createdByUserId: params.createdByUserId,
          status: 'POSTED',
          postedAt: new Date(),
          ledgerEntries: {
            create: await Promise.all(
              params.lines.map(async (line, idx) => ({
                financialAccountId: await this.getAccountId(line.accountCode),
                debit: new Decimal(line.debit ?? 0),
                credit: new Decimal(line.credit ?? 0),
                memo: line.memo,
                lineNumber: idx + 1,
              })),
            ),
          },
        },
        include: { ledgerEntries: true },
      });

    if (tx) return write(tx);

    return this.prisma.$transaction(write, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  /**
   * Debits = amount paid. Credits = seller payable + commission +
   * platform product sales + shipping, which sum to the amount paid.
   * The platform absorbs the gateway fee as an expense.
   */
  async capturePayment(
    tx: Prisma.TransactionClient,
    p: {
      orderId: string;
      amount: Decimal;
      paystackRef: string;
      userId: string;
      sellerNetTotal: Decimal;
      commissionTotal: Decimal;
      platformSalesTotal: Decimal;
      shippingTotal: Decimal;
    },
  ) {
    const gatewayFee = p.amount
      .mul(GATEWAY_FEE_RATE)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const netReceived = p.amount.minus(gatewayFee);

    const lines: LedgerLine[] = [
      {
        accountCode: AccountCode.PAYMENT_CLEARING,
        debit: netReceived,
        memo: `Paystack net settlement ${p.paystackRef}`,
      },
      {
        accountCode: AccountCode.PAYMENT_PROCESSING_EXPENSE,
        debit: gatewayFee,
        memo: `Paystack fee ${p.paystackRef}`,
      },
      {
        accountCode: AccountCode.SELLER_PAYABLE,
        credit: p.sellerNetTotal,
        memo: `Seller net for order ${p.orderId}`,
      },
      {
        accountCode: AccountCode.COMMISSION_REVENUE,
        credit: p.commissionTotal,
        memo: `Commission order ${p.orderId}`,
      },
      {
        accountCode: AccountCode.PRODUCT_SALES_REVENUE,
        credit: p.platformSalesTotal,
        memo: `Platform product sales order ${p.orderId}`,
      },
      {
        accountCode: AccountCode.SHIPPING_REVENUE,
        credit: p.shippingTotal,
        memo: `Shipping order ${p.orderId}`,
      },
    ].filter(
      (l: LedgerLine) =>
        !new Decimal(l.debit ?? 0).isZero() ||
        !new Decimal(l.credit ?? 0).isZero(),
    );

    return this.postTransaction(
      {
        reference: `PAY_CAP_${p.paystackRef}`,
        type: 'PAYMENT_CAPTURE',
        description: `Payment captured for order ${p.orderId}`,
        orderId: p.orderId,
        idempotencyKey: `paystack_${p.paystackRef}`,
        createdByUserId: p.userId,
        lines,
      },
      tx,
    );
  }

  async getAccountBalance(accountCode: string): Promise<Decimal> {
    const accountId = await this.getAccountId(accountCode);
    const result = await this.prisma.ledgerEntry.aggregate({
      where: {
        financialAccountId: accountId,
        financialTransaction: { status: 'POSTED' },
      },
      _sum: { debit: true, credit: true },
    });
    const debit = new Decimal(result._sum.debit ?? 0);
    const credit = new Decimal(result._sum.credit ?? 0);
    const type = await this.prisma.financialAccount.findUnique({
      where: { id: accountId },
      select: { type: true },
    });
    return type?.type === 'ASSET' || type?.type === 'EXPENSE'
      ? debit.minus(credit)
      : credit.minus(debit);
  }

  async getTrialBalance() {
    const accounts = await this.prisma.financialAccount.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
    return Promise.all(
      accounts.map(async (acc) => ({
        code: acc.code,
        name: acc.name,
        type: acc.type,
        balance: await this.getAccountBalance(acc.code),
      })),
    );
  }
}
