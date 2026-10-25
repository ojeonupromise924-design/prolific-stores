import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { FinanceService } from '../finance.service';
import { AuditService } from '../audit/audit.service';
import { AccountCode } from '../constants/account-codes';
import { PaystackService } from '../../orders/paystack.service';

/** Differences at or below this are treated as rounding noise. */
const DEFAULT_TOLERANCE = new Decimal('0.01');

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly finance: FinanceService,
    private readonly audit: AuditService,
    private readonly paystack: PaystackService,
  ) {}

  /**
   * Compares what the system believes against what Paystack actually
   * settled, and records the differences.
   *
   * The point is to catch money leakage before it becomes invisible: a fee
   * we estimated wrongly, a payment Paystack never received, a refund we
   * recorded but Paystack did not.
   */
  async run(options: { days?: number; actorId?: string } = {}) {
    const days = options.days ?? 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        paidAt: { gte: since, not: null },
        order: { paystackRef: { not: null } },
      },
      include: { order: { select: { id: true, total: true, paystackRef: true } } },
      orderBy: { paidAt: 'asc' },
      take: 500,
    });

    const reconciliation = await this.prisma.reconciliation.create({
      data: {
        provider: 'paystack',
        reconciliationDate: new Date(),
        totalSystemAmount: new Decimal(0),
        totalProviderAmount: new Decimal(0),
        matchedCount: 0,
        unmatchedCount: 0,
        status: 'UNMATCHED',
      },
    });

    let totalSystem = new Decimal(0);
    let totalProvider = new Decimal(0);
    let matched = 0;
    let unmatched = 0;
    let exceptions = 0;

    for (const payment of payments) {
      const reference = payment.order?.paystackRef;
      if (!reference) continue;

      const systemAmount = new Decimal(payment.amount);
      totalSystem = totalSystem.plus(systemAmount);

      let providerAmount: Decimal | null = null;
      let providerStatus: string | null = null;
      let providerFees: Decimal | null = null;

      try {
        const timeline = await this.paystack.transactionTimeline(reference);
        providerAmount = new Decimal(timeline.net_amount ?? timeline.amount);
        providerStatus = timeline.status;
        providerFees = new Decimal(timeline.fees ?? 0);
        totalProvider = totalProvider.plus(providerAmount);
      } catch (error) {
        this.logger.warn(
          `Could not fetch timeline for ${reference}: ${error instanceof Error ? error.message : String(error)}`,
        );
        unmatched++;
        exceptions++;

        await this.prisma.reconciliationItem.create({
          data: {
            reconciliationId: reconciliation.id,
            internalReference: reference,
            providerReference: reference,
            systemAmount,
            providerAmount: new Decimal(0),
            difference: systemAmount,
            status: 'EXCEPTION',
            notes: 'Provider timeline unavailable — transaction could not be verified.',
          },
        });

        continue;
      }

      const difference = systemAmount.minus(providerAmount);
      const withinTolerance = difference.abs().lessThanOrEqualTo(DEFAULT_TOLERANCE);

      if (withinTolerance && providerStatus === 'success') {
        matched++;
      } else {
        unmatched++;
        exceptions++;

        await this.prisma.reconciliationItem.create({
          data: {
            reconciliationId: reconciliation.id,
            internalReference: reference,
            providerReference: reference,
            systemAmount,
            providerAmount,
            difference,
            status: 'EXCEPTION',
            notes: this.explainDifference(
              systemAmount,
              providerAmount,
              providerStatus,
              providerFees,
            ),
          },
        });
      }
    }

    const status = exceptions === 0 ? 'RESOLVED' : unmatched > 0 ? 'EXCEPTION' : 'MATCHED';

    const updated = await this.prisma.reconciliation.update({
      where: { id: reconciliation.id },
      data: {
        totalSystemAmount: totalSystem,
        totalProviderAmount: totalProvider,
        matchedCount: matched,
        unmatchedCount: unmatched,
        status,
      },
    });

    await this.audit.log({
      actorId: options.actorId,
      action: 'RECONCILIATION_RUN',
      entityType: 'Reconciliation',
      entityId: updated.id,
      after: {
        status,
        matched,
        unmatched,
        exceptions,
        totalSystem: totalSystem.toString(),
        totalProvider: totalProvider.toString(),
      },
    });

    return {
      id: updated.id,
      status: updated.status,
      matchedCount: matched,
      unmatchedCount: unmatched,
      exceptions,
      totalSystemAmount: Number(totalSystem),
      totalProviderAmount: Number(totalProvider),
    };
  }

  /**
   * Turns a raw difference into a likely explanation, so the exceptions
   * queue is actionable rather than just a list of mismatches.
   */
  private explainDifference(
    systemAmount: Decimal,
    providerAmount: Decimal,
    providerStatus: string | null,
    providerFees: Decimal | null,
  ): string {
    if (providerStatus && providerStatus !== 'success') {
      return `Provider reports the transaction as "${providerStatus}" while the system recorded it as successful.`;
    }

    if (providerFees && !providerFees.isZero()) {
      const implied = systemAmount.minus(providerAmount);
      if (implied.abs().lessThanOrEqualTo(providerFees.abs().plus(DEFAULT_TOLERANCE))) {
        return 'Difference is explained by the provider fee charged on this transaction.';
      }
    }

    if (providerAmount.lessThan(systemAmount)) {
      return 'Provider settled less than the system recorded — likely a partial settlement or an unrecorded fee.';
    }

    if (providerAmount.greaterThan(systemAmount)) {
      return 'Provider settled more than the system recorded — likely a duplicate capture or an unrecorded credit.';
    }

    return 'Amounts differ beyond the provider fee — investigate manually.';
  }

  /**
   * Posts the real provider fee for a transaction, correcting the estimate
   * that was used at capture time. Called once reconciliation knows the
   * actual figure.
   */
  async postFeeCorrection(params: {
    reference: string;
    orderId: string;
    estimatedFee: Decimal;
    actualFee: Decimal;
    actorId?: string;
  }) {
    const difference = params.actualFee.minus(params.estimatedFee);

    if (difference.isZero()) return null;

    // A higher real fee is an extra expense; a lower one reverses part of it.
    const lines =
      difference.isPositive()
        ? [
            {
              accountCode: AccountCode.PAYMENT_PROCESSING_EXPENSE,
              debit: difference,
              memo: `Gateway fee correction ${params.reference}`,
            },
            {
              accountCode: AccountCode.PAYMENT_CLEARING,
              credit: difference,
              memo: `Gateway fee correction ${params.reference}`,
            },
          ]
        : [
            {
              accountCode: AccountCode.PAYMENT_CLEARING,
              debit: difference.abs(),
              memo: `Gateway fee correction ${params.reference}`,
            },
            {
              accountCode: AccountCode.PAYMENT_PROCESSING_EXPENSE,
              credit: difference.abs(),
              memo: `Gateway fee correction ${params.reference}`,
            },
          ];

    return this.finance.postTransaction({
      reference: `FEE_CORR_${params.reference}`,
      type: 'ADJUSTMENT',
      description: `Gateway fee correction for ${params.orderId}`,
      idempotencyKey: `fee_correction_${params.reference}`,
      createdByUserId: params.actorId,
      orderId: params.orderId,
      lines,
    });
  }

  async getLatest() {
    const latest = await this.prisma.reconciliation.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    if (!latest) return null;

    return {
      ...latest,
      totalSystemAmount: Number(latest.totalSystemAmount),
      totalProviderAmount: Number(latest.totalProviderAmount),
      items: latest.items.map((i) => ({
        ...i,
        systemAmount: Number(i.systemAmount),
        providerAmount: Number(i.providerAmount),
        difference: Number(i.difference),
      })),
    };
  }

  async listExceptions(filters: { page?: number; limit?: number } = {}) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;

    const where: Prisma.ReconciliationItemWhereInput = { status: 'EXCEPTION' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.reconciliationItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          reconciliation: { select: { id: true, provider: true, reconciliationDate: true } },
        },
      }),
      this.prisma.reconciliationItem.count({ where }),
    ]);

    return {
      data: data.map((i) => ({
        ...i,
        systemAmount: Number(i.systemAmount),
        providerAmount: Number(i.providerAmount),
        difference: Number(i.difference),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Daily reconciliation sweep. This is what keeps the dashboard's
   * "does our database agree with the payment provider" answer honest.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async scheduledRun() {
    try {
      const result = await this.run();
      this.logger.log(
        `Reconciliation complete: ${result.matchedCount} matched, ${result.unmatchedCount} unmatched, ${result.exceptions} exceptions`,
      );
    } catch (error) {
      this.logger.error(
        'Scheduled reconciliation failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
