import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { FinanceService } from '../finance.service';
import { SettlementService } from '../settlements/settlement.service';
import { AuditService } from '../audit/audit.service';
import { AccountCode } from '../constants/account-codes';
import { PaystackService } from '../../orders/paystack.service';

export interface PayoutBatchSummary {
  id: string;
  reference: string;
  status: string;
  totalAmount: number;
  sellerCount: number;
  payoutCount: number;
  createdAt: Date;
  approvedAt: Date | null;
  processedAt: Date | null;
}

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly finance: FinanceService,
    private readonly settlementService: SettlementService,
    private readonly audit: AuditService,
    private readonly paystack: PaystackService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // Batch construction
  // ─────────────────────────────────────────────────────────────

  /**
   * Builds a payout batch from every settlement currently marked ELIGIBLE.
   *
   * Settlements are grouped per seller so a seller with 40 orders receives
   * one transfer, not 40. The batch is created in REVIEW — nothing is sent
   * to a bank until a finance officer approves it.
   */
  async buildBatch(actorId?: string): Promise<PayoutBatchSummary> {
    const eligible = await this.prisma.sellerSettlement.findMany({
      where: { status: 'ELIGIBLE' },
      include: { seller: true },
      orderBy: { createdAt: 'asc' },
    });

    if (eligible.length === 0) {
      throw new BadRequestException(
        'No eligible settlements available for payout',
      );
    }

    // Group settlements by seller.
    const bySeller = new Map<string, typeof eligible>();
    for (const settlement of eligible) {
      const list = bySeller.get(settlement.sellerId) ?? [];
      list.push(settlement);
      bySeller.set(settlement.sellerId, list);
    }

    // Refunds are NOT deducted here. When a refund completes, the refund
    // engine already reduces the settlement's netAmount and the seller's
    // balance (see RefundService.applyRefundToSettlements). Deducting
    // them again would claw the money back twice.

    const reference = `PS-PAYOUT-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}-${randomBytes(3).toString('hex').toUpperCase()}`;

    const result = await this.prisma.$transaction(
      async (tx) => {
        const batch = await tx.payoutBatch.create({
          data: {
            reference,
            totalAmount: new Decimal(0),
            sellerCount: bySeller.size,
            payoutCount: bySeller.size,
            status: 'PENDING',
          },
        });

        let batchTotal = new Decimal(0);

        for (const [sellerId, settlements] of bySeller) {
          const seller = settlements[0].seller;

          const totalNet = settlements.reduce(
            (sum, s) => sum.plus(s.netAmount),
            new Decimal(0),
          );

          const adjustments = settlements.reduce(
            (sum, s) => sum.plus(s.adjustments),
            new Decimal(0),
          );

          const net = totalNet.minus(adjustments);

          if (net.lessThanOrEqualTo(0)) continue;

          // Split the deductions across the settlements in proportion to
          // what each one contributed. The per-settlement amounts must sum
          // exactly to the payout amount: if they do not, a failed payout
          // would restore a different amount than was reserved, and the
          // seller's balance would drift.
          const shares = this.distributeDeductions(settlements, adjustments);

          const payout = await tx.sellerPayout.create({
            data: {
              sellerId,
              batchId: batch.id,
              reference: `PAY-${reference}-${sellerId.slice(0, 6)}`,
              amount: net,
              status: 'PENDING',
              requestedAt: new Date(),
            },
          });

          await tx.sellerPayoutSettlement.createMany({
            data: settlements.map((s, i) => ({
              payoutId: payout.id,
              settlementId: s.id,
              amount: shares[i],
            })),
          });

          // Ledger: the platform's liability to the seller is settled.
          //   DR SELLER_PAYABLE      (we no longer owe it)
          //   CR PROLIFIC_BANK       (money leaves the platform)
          await this.finance.postTransaction(
            {
              reference: `PAYOUT_${payout.id}`,
              type: 'PAYOUT',
              description: `Payout to seller ${seller.businessName}`,
              idempotencyKey: `payout_${payout.id}`,
              createdByUserId: actorId,
              lines: [
                {
                  accountCode: AccountCode.SELLER_PAYABLE,
                  debit: net,
                  memo: `Payout ${payout.reference}`,
                },
                {
                  accountCode: AccountCode.PROLIFIC_BANK,
                  credit: net,
                  memo: `Disbursement ${payout.reference}`,
                },
              ],
            },
            tx,
          );

          // Reserve the money out of the seller's available bucket while
          // the batch is in flight.
          await tx.sellerBalance.update({
            where: { sellerId },
            data: { availableAmount: { decrement: net } },
          });

          await this.settlementService.markProcessing(
            tx,
            settlements.map((s) => s.id),
          );

          batchTotal = batchTotal.plus(net);
        }

        const updated = await tx.payoutBatch.update({
          where: { id: batch.id },
          data: { totalAmount: batchTotal, status: 'PENDING' },
        });

        return {
          id: updated.id,
          reference: updated.reference,
          status: updated.status,
          totalAmount: Number(updated.totalAmount),
          sellerCount: updated.sellerCount,
          payoutCount: updated.payoutCount,
          createdAt: updated.createdAt,
          approvedAt: updated.approvedAt,
          processedAt: updated.processedAt,
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );

    await this.audit.log({
      actorId,
      action: 'PAYOUT_BATCH_BUILD',
      entityType: 'PayoutBatch',
      entityId: result.id,
      after: {
        reference: result.reference,
        status: result.status,
        totalAmount: result.totalAmount,
        sellerCount: result.sellerCount,
        payoutCount: result.payoutCount,
      },
    });

    return result;
  }

  // ─────────────────────────────────────────────────────────────
  // Approval
  // ─────────────────────────────────────────────────────────────

  async approve(batchId: string, actorId: string): Promise<PayoutBatchSummary> {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
      include: { payouts: true },
    });

    if (!batch) throw new NotFoundException('Payout batch not found');

    if (batch.status !== 'PENDING' && batch.status !== 'FAILED') {
      throw new BadRequestException(
        `Batch ${batch.reference} cannot be approved from status ${batch.status}`,
      );
    }

    const pendingPayouts = batch.payouts.filter(
      (p) => p.status === 'PENDING' || p.status === 'FAILED',
    );

    if (pendingPayouts.length === 0) {
      throw new BadRequestException(
        'This batch has no payouts left to approve',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payoutBatch.update({
        where: { id: batchId },
        data: {
          status: 'APPROVED',
          approvedById: actorId,
          approvedAt: new Date(),
        },
      });

      await tx.sellerPayout.updateMany({
        where: { id: { in: pendingPayouts.map((p) => p.id) } },
        data: { status: 'APPROVED' },
      });
    });

    await this.audit.log({
      actorId,
      action: 'PAYOUT_BATCH_APPROVE',
      entityType: 'PayoutBatch',
      entityId: batchId,
      before: { status: batch.status },
      after: { status: 'APPROVED' },
    });

    return this.getBatch(batchId);
  }

  // ─────────────────────────────────────────────────────────────
  // Processing (disbursement)
  // ─────────────────────────────────────────────────────────────

  /**
   * Sends the approved batch to Paystack.
   *
   * A single failed transfer must never fail the batch — 197 paid and 3
   * failed is a valid outcome, and the 3 stay retryable.
   */
  async process(
    batchId: string,
    actorId?: string,
  ): Promise<PayoutBatchSummary> {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
      include: {
        payouts: { include: { seller: true } },
      },
    });

    if (!batch) throw new NotFoundException('Payout batch not found');

    if (batch.status !== 'APPROVED') {
      throw new BadRequestException(
        `Batch ${batch.reference} must be approved before processing (current: ${batch.status})`,
      );
    }

    const toProcess = batch.payouts.filter(
      (p) => p.status === 'APPROVED' || p.status === 'FAILED',
    );

    if (toProcess.length === 0) {
      throw new BadRequestException(
        'This batch has no payouts left to process',
      );
    }

    await this.prisma.payoutBatch.update({
      where: { id: batchId },
      data: { status: 'PROCESSING', processedAt: new Date() },
    });

    // Resolve a transfer recipient per seller first — this is a one-time
    // cost per merchant and is cached on the Seller row.
    for (const payout of toProcess) {
      try {
        await this.ensureRecipient(payout.seller);
      } catch (error: unknown) {
        if (!(error instanceof Error)) throw error;
        await this.failPayout(payout.id, batchId, error);
      }
    }

    const ready = toProcess.filter((p) => p.status === 'APPROVED');

    // Chunk to Paystack's limit and throttle between chunks.
    const chunks: (typeof ready)[] = [];
    for (let i = 0; i < ready.length; i += PaystackService.BULK_TRANSFER_MAX) {
      chunks.push(ready.slice(i, i + PaystackService.BULK_TRANSFER_MAX));
    }

    for (let c = 0; c < chunks.length; c++) {
      const chunk = chunks[c];

      const transfers: Array<{
        amountInKobo: number;
        recipientCode: string;
        reference: string;
        reason: string;
      }> = [];
      for (const payout of chunk) {
        if (!payout.seller.recipientCode) continue;
        transfers.push({
          amountInKobo: Math.round(Number(payout.amount) * 100),
          recipientCode: payout.seller.recipientCode,
          reference: payout.reference,
          reason: 'Seller settlement payout',
        });
      }

      if (transfers.length === 0) continue;

      try {
        const result = await this.paystack.bulkTransfer({ transfers });

        for (const transfer of result.transfers) {
          const payout = chunk.find((p) => p.reference === transfer.reference);
          if (!payout) continue;

          const succeeded =
            transfer.status === 'success' || transfer.status === 'SUCCESS';

          await this.prisma.$transaction(async (tx) => {
            await tx.sellerPayout.update({
              where: { id: payout.id },
              data: {
                status: succeeded ? 'COMPLETED' : 'FAILED',
                provider: 'paystack',
                providerReference: String(transfer.id ?? ''),
                failureReason: succeeded
                  ? null
                  : `Transfer status: ${transfer.status}`,
                processedAt: new Date(),
              },
            });

            await tx.paymentAttempt.create({
              data: {
                payoutId: payout.id,
                provider: 'paystack',
                paystackRef: payout.reference,
                amount: payout.amount,
                status: succeeded ? 'SUCCESS' : 'FAILED',
                failureMessage: succeeded
                  ? null
                  : `Transfer status: ${transfer.status}`,
                metadata: { batchId, transferId: transfer.id },
              },
            });

            if (succeeded) {
              // The seller's money has left the platform. Mark it paid on
              // the operational balance so the dashboard shows what went
              // out, not just what is owed.
              await tx.sellerBalance.update({
                where: { sellerId: payout.sellerId },
                data: { paidAmount: { increment: payout.amount } },
              });
            }
          });

          await this.audit.log({
            actorId,
            action: succeeded ? 'PAYOUT_SUCCEEDED' : 'PAYOUT_FAILED',
            entityType: 'SellerPayout',
            entityId: payout.id,
            after: {
              status: succeeded ? 'COMPLETED' : 'FAILED',
              reference: payout.reference,
            },
          });

          if (!succeeded) {
            // Paystack rejected this individual transfer, so the money did
            // not leave the platform. The ledger entry posted when the
            // batch was built has to be undone, exactly as it is for a
            // chunk-level failure.
            await this.reversePayoutLedger(
              payout.id,
              `Transfer failed: ${transfer.status}`,
            );
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        for (const payout of chunk) {
          await this.failPayout(payout.id, batchId, new Error(message));
        }
      }

      // Respect Paystack's rate limit between chunks.
      if (c < chunks.length - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, PaystackService.BULK_TRANSFER_INTERVAL_MS),
        );
      }
    }

    // Any payout that never made it out of APPROVED (recipient failure) is
    // already marked FAILED by failPayout.
    const finalState = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
      include: { payouts: true },
    });

    const allDone = finalState!.payouts.every(
      (p) =>
        p.status === 'COMPLETED' ||
        p.status === 'FAILED' ||
        p.status === 'REVERSED',
    );
    const anyFailed = finalState!.payouts.some((p) => p.status === 'FAILED');

    await this.prisma.payoutBatch.update({
      where: { id: batchId },
      data: {
        status: allDone ? (anyFailed ? 'FAILED' : 'COMPLETED') : 'PROCESSING',
      },
    });

    // Money that failed to go out goes back to the seller's available bucket
    // so it can be retried rather than silently vanishing. The amount
    // restored is exactly the amount that was reserved when the batch was
    // built — the per-settlement links carry that split.
    const failed = finalState!.payouts.filter((p) => p.status === 'FAILED');
    if (failed.length > 0) {
      await this.prisma.$transaction(async (tx) => {
        for (const payout of failed) {
          const links = await tx.sellerPayoutSettlement.findMany({
            where: { payoutId: payout.id },
            include: { settlement: true },
          });

          await this.settlementService.releaseToAvailable(
            tx,
            links.map((l) => ({
              id: l.settlementId,
              sellerId: payout.sellerId,
              netAmount: l.amount,
            })),
          );

          // The settlement rows go back to ELIGIBLE, but the seller's
          // available bucket was reduced by the whole payout amount, not
          // by the per-settlement shares. Restore the difference.
          const shareTotal = links.reduce(
            (sum, l) => sum.plus(l.amount),
            new Decimal(0),
          );

          const reserved = new Decimal(payout.amount);
          const shortfall = reserved.minus(shareTotal);

          if (shortfall.greaterThan(0)) {
            await tx.sellerBalance.update({
              where: { sellerId: payout.sellerId },
              data: { availableAmount: { increment: shortfall } },
            });
          }
        }
      });
    }

    await this.audit.log({
      actorId,
      action: 'PAYOUT_BATCH_PROCESS',
      entityType: 'PayoutBatch',
      entityId: batchId,
      after: {
        status: allDone ? (anyFailed ? 'FAILED' : 'COMPLETED') : 'PROCESSING',
      },
    });

    return this.getBatch(batchId);
  }

  private async failPayout(
    payoutId: string,
    batchId: string,
    error: Error,
  ): Promise<void> {
    const message = error.message || 'Unknown payout failure';

    // Failing a payout is idempotent. A chunk-level failure can arrive after
    // an individual transfer in the same chunk was already recorded as
    // failed, and the retry path can reach here again. Without this guard
    // each occurrence writes another PaymentAttempt row and attempts
    // another ledger reversal.
    const alreadyFailed = await this.prisma.paymentAttempt.findFirst({
      where: { payoutId, status: 'FAILED' },
      select: { id: true },
    });

    if (alreadyFailed) {
      this.logger.warn(
        `Payout ${payoutId} was already marked FAILED — skipping duplicate failure handling`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.sellerPayout.update({
        where: { id: payoutId },
        data: { status: 'FAILED', failureReason: message },
      });

      await tx.paymentAttempt.create({
        data: {
          payoutId,
          provider: 'paystack',
          amount: new Decimal(0),
          status: 'FAILED',
          failureMessage: message,
          metadata: { batchId },
        },
      });
    });

    // The money did not leave the platform, so the ledger entry that
    // reserved it has to be undone. Without this, SELLER_PAYABLE stays
    // debited and the money is neither owed to the seller nor held by
    // the platform — it simply disappears from the books.
    await this.reversePayoutLedger(payoutId, message);

    await this.audit.log({
      action: 'PAYOUT_FAILED',
      entityType: 'SellerPayout',
      entityId: payoutId,
      after: { reason: message },
    });
  }

  /**
   * Splits a payout amount across the settlements it covers, in proportion
   * to each settlement's net amount, after deductions.
   *
   * The shares must sum to exactly the payout amount — no more, no less.
   * They are what a failed payout restores to the seller's balance, so a
   * rounding gap would leak money on every failed payout. Any remainder
   * left by rounding is added to the largest share.
   */
  private distributeDeductions(
    settlements: Array<{ netAmount: Decimal }>,
    adjustments: Decimal,
  ): Decimal[] {
    const totalNet = settlements.reduce(
      (sum, s) => sum.plus(s.netAmount),
      new Decimal(0),
    );

    const payoutAmount = totalNet.minus(adjustments);

    if (payoutAmount.lessThanOrEqualTo(0)) {
      return settlements.map(() => new Decimal(0));
    }

    const shares: Decimal[] = [];
    let allocated = new Decimal(0);

    for (const settlement of settlements) {
      const share = totalNet.isZero()
        ? new Decimal(0)
        : new Decimal(settlement.netAmount)
            .mul(payoutAmount)
            .div(totalNet)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      shares.push(share);
      allocated = allocated.plus(share);
    }

    // Give any rounding remainder to the biggest share so the total is
    // exact.
    const remainder = payoutAmount.minus(allocated);

    if (!remainder.isZero()) {
      let largest = 0;
      for (let i = 1; i < shares.length; i++) {
        if (shares[i].greaterThan(shares[largest])) largest = i;
      }
      shares[largest] = shares[largest].plus(remainder);
    }

    return shares;
  }

  /**
   * Reverses the ledger entry posted when this payout was built.
   *
   * The reversal is idempotent: it uses the payout id as its idempotency
   * key, so a payout that fails twice does not post two reversals.
   */
  private async reversePayoutLedger(
    payoutId: string,
    reason: string,
  ): Promise<void> {
    const payout = await this.prisma.sellerPayout.findUnique({
      where: { id: payoutId },
      select: { id: true, reference: true },
    });

    if (!payout) return;

    const originalReference = `PAYOUT_${payout.id}`;

    const original = await this.prisma.financialTransaction.findUnique({
      where: { reference: originalReference },
      select: { id: true, reference: true, type: true },
    });

    // Nothing was posted (or it was already reversed) — nothing to undo.
    if (!original) return;

    const alreadyReversed = await this.prisma.financialTransaction.findUnique({
      where: { reference: `REV_${original.reference}` },
      select: { id: true },
    });

    if (alreadyReversed) return;

    try {
      await this.finance.reverseTransaction(
        original,
        `Payout ${payout.reference} failed: ${reason}`,
      );
    } catch (error) {
      // A failed reversal must not mask the original failure.
      this.logger.error(
        `Could not reverse ledger for payout ${payoutId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Resolves (and caches) the Paystack transfer recipient code for a seller.
   * Recipients are created once per merchant and reused for every batch.
   */
  private async ensureRecipient(seller: {
    id: string;
    recipientCode: string | null;
    accountName: string;
    accountNumber: string;
    bankName: string;
  }): Promise<string> {
    if (seller.recipientCode) return seller.recipientCode;

    const bank = await this.resolveBankCode(seller.bankName);

    let code: string;
    try {
      code = await this.paystack.createTransferRecipient({
        name: seller.accountName || seller.bankName,
        accountNumber: seller.accountNumber,
        bankCode: bank,
      });
    } catch (error) {
      // The account is probably already registered — recover the code.
      const existing = await this.paystack.listTransferRecipients({
        accountNumber: seller.accountNumber,
      });

      const match = existing.find(
        (r) => r.accountNumber === seller.accountNumber,
      );

      if (!match) throw error;
      code = match.code;
    }

    await this.prisma.seller.update({
      where: { id: seller.id },
      data: { recipientCode: code },
    });

    return code;
  }

  /**
   * Sellers store a bank name; Paystack needs the numeric bank code. Cached
   * in memory for the process lifetime — the list changes roughly never.
   */
  private bankCodes: Array<{ name: string; code: string }> | null = null;

  private async resolveBankCode(bankName: string): Promise<string> {
    if (!this.bankCodes) {
      this.bankCodes = await this.paystack.listBanks();
    }

    const normalized = bankName.trim().toLowerCase();
    const match = this.bankCodes.find(
      (b) =>
        b.name.toLowerCase() === normalized ||
        b.name.toLowerCase().includes(normalized) ||
        normalized.includes(b.name.toLowerCase()),
    );

    if (!match) {
      throw new BadRequestException(
        `Could not resolve a Paystack bank code for "${bankName}"`,
      );
    }

    return match.code;
  }

  // ─────────────────────────────────────────────────────────────
  // Reads
  // ─────────────────────────────────────────────────────────────

  async getBatch(batchId: string): Promise<PayoutBatchSummary> {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) throw new NotFoundException('Payout batch not found');

    return {
      id: batch.id,
      reference: batch.reference,
      status: batch.status,
      totalAmount: Number(batch.totalAmount),
      sellerCount: batch.sellerCount,
      payoutCount: batch.payoutCount,
      createdAt: batch.createdAt,
      approvedAt: batch.approvedAt,
      processedAt: batch.processedAt,
    };
  }

  async listBatches(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const where = filters.status
      ? { status: filters.status as Prisma.PayoutBatchWhereInput['status'] }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.payoutBatch.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          payouts: {
            select: {
              id: true,
              status: true,
              amount: true,
              seller: { select: { businessName: true, userId: true } },
            },
          },
        },
      }),
      this.prisma.payoutBatch.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBatchDetail(batchId: string) {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
      include: {
        payouts: {
          include: {
            seller: {
              select: {
                id: true,
                businessName: true,
                businessEmail: true,
                bankName: true,
                accountName: true,
              },
            },
            settlements: {
              include: {
                settlement: {
                  select: {
                    id: true,
                    orderId: true,
                    netAmount: true,
                    status: true,
                  },
                },
              },
            },
            attempts: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    if (!batch) throw new NotFoundException('Payout batch not found');
    return batch;
  }

  async getSellerPayouts(sellerId: string) {
    return this.prisma.sellerPayout.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: { batch: { select: { reference: true, status: true } } },
    });
  }

  /**
   * Safety net: batches that were approved but never processed (a crash
   * between approval and disbursement) get picked up by the scheduler.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processStuckApprovedBatches(): Promise<void> {
    try {
      const stuck = await this.prisma.payoutBatch.findMany({
        where: { status: 'APPROVED' },
        take: 5,
      });

      for (const batch of stuck) {
        this.logger.log(`Processing stuck approved batch ${batch.reference}`);
        await this.process(batch.id);
      }
    } catch (error) {
      this.logger.error(
        'Stuck payout batch sweep failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
