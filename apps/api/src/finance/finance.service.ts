import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, FinancialTransactionType } from '@prisma/client';
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
  type:
    | 'PAYMENT_CAPTURE'
    | 'TRANSFER'
    | 'ADJUSTMENT'
    | 'REVERSAL'
    | 'REFUND'
    | 'PAYOUT'
    | 'SETTLEMENT';
  description?: string;
  orderId?: string;
  idempotencyKey?: string;
  createdByUserId?: string;
  /// Links a correction to the transaction it reverses. History is never
  /// edited — a correction is a new transaction pointing backwards.
  reversesTransactionId?: string;
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
    if (params.lines.length < 2) {
      throw new BadRequestException(
        'A ledger transaction needs at least two lines',
      );
    }

    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    for (const line of params.lines) {
      const debit = new Decimal(line.debit ?? 0);
      const credit = new Decimal(line.credit ?? 0);
      if (debit.gt(0) && credit.gt(0)) {
        throw new BadRequestException(
          'A ledger line cannot have both a debit and a credit',
        );
      }
      totalDebit = totalDebit.plus(debit);
      totalCredit = totalCredit.plus(credit);
    }

    if (totalDebit.isZero()) {
      throw new BadRequestException(
        'Ledger transaction total must be greater than zero',
      );
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
          reversesTransactionId: params.reversesTransactionId,
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
   * Posts the exact opposite of an existing transaction.
   *
   * History is never edited: a correction is a new REVERSAL that points
   * back at the transaction it undoes, so the ledger stays append-only and
   * the original mistake is still visible.
   */
  async reverseTransaction(
    original: { id: string; reference: string; type: FinancialTransactionType },
    reason: string,
    actorId?: string,
  ) {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { financialTransactionId: original.id },
      include: { financialAccount: { select: { code: true } } },
    });

    if (entries.length === 0) {
      throw new BadRequestException(
        `Transaction ${original.reference} has no ledger entries to reverse`,
      );
    }

    return this.postTransaction({
      reference: `REV_${original.reference}`,
      type: 'REVERSAL',
      description: reason,
      idempotencyKey: `reversal_${original.id}`,
      createdByUserId: actorId,
      reversesTransactionId: original.id,
      lines: entries.map((e) => ({
        accountCode: e.financialAccount.code,
        debit: e.credit,
        credit: e.debit,
        memo: `Reversal of ${original.reference}`,
      })),
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
