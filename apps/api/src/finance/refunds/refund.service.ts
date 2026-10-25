import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { FinanceService } from '../finance.service';
import { AuditService } from '../audit/audit.service';
import { AccountCode } from '../constants/account-codes';

/**
 * Who may approve a refund of a given size. These mirror the finance
 * approval ladder — the thresholds are a starting point and should be
 * confirmed with the business.
 */
export const REFUND_APPROVAL_TIERS = [
  { max: new Decimal('10000'), role: 'ADMIN' },
  { max: new Decimal('100000'), role: 'ADMIN' },
  { max: new Decimal('500000'), role: 'SUPER_ADMIN' },
  { max: null, role: 'SUPER_ADMIN' },
] as const;

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly finance: FinanceService,
    private readonly audit: AuditService,
  ) {}

  /** The role required to approve a refund of this amount. */
  requiredRoleFor(amount: Decimal | number | string): string {
    const value = new Decimal(amount);
    for (const tier of REFUND_APPROVAL_TIERS) {
      if (tier.max === null || value.lessThanOrEqualTo(tier.max)) {
        return tier.role;
      }
    }
    return 'SUPER_ADMIN';
  }

  /**
   * Records a refund request. The original order total is never modified —
   * the refund is a separate money movement that nets against it.
   */
  async request(params: {
    orderId: string;
    amount: Decimal | number | string;
    reason: string;
    requestedById?: string;
  }): Promise<{ id: string; reference: string; status: string; amount: number }> {
    const amount = new Decimal(params.amount);

    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Refund amount must be positive');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: params.orderId },
      include: { payment: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (!order.payment) {
      throw new BadRequestException(
        'This order has no completed payment, so it cannot be refunded',
      );
    }

    // Never allow refunding more than was paid.
    const alreadyRefunded = await this.prisma.refund.aggregate({
      where: { orderId: params.orderId, status: { in: ['REQUESTED', 'REVIEWING', 'APPROVED', 'PROCESSING', 'COMPLETED'] } },
      _sum: { amount: true },
    });

    const refundedSoFar = alreadyRefunded._sum.amount ?? new Decimal(0);
    const refundable = new Decimal(order.payment.amount).minus(refundedSoFar);

    if (amount.greaterThan(refundable)) {
      throw new BadRequestException(
        `Refund of ${amount.toString()} exceeds the refundable balance of ${refundable.toString()}`,
      );
    }

    const reference = `REF-${randomBytes(5).toString('hex').toUpperCase()}`;

    const refund = await this.prisma.refund.create({
      data: {
        reference,
        orderId: params.orderId,
        paymentId: order.payment.id,
        amount,
        reason: params.reason,
        status: 'REQUESTED',
        requestedById: params.requestedById ?? null,
        requestedAt: new Date(),
      },
    });

    await this.audit.log({
      actorId: params.requestedById,
      action: 'REFUND_REQUESTED',
      entityType: 'Refund',
      entityId: refund.id,
      after: { reference, amount: amount.toString(), orderId: params.orderId },
    });

    return {
      id: refund.id,
      reference: refund.reference,
      status: refund.status,
      amount: Number(refund.amount),
    };
  }

  /** Moves a request into review, ready for a decision. */
  async startReview(refundId: string, actorId: string) {
    const refund = await this.getRefund(refundId);

    if (refund.status !== 'REQUESTED') {
      throw new BadRequestException(
        `Only a REQUESTED refund can enter review (current: ${refund.status})`,
      );
    }

    return this.prisma.refund.update({
      where: { id: refundId },
      data: { status: 'REVIEWING' },
    });
  }

  /**
   * Approves a refund. The approver's role must meet the tier for the
   * refund amount.
   */
  async approve(refundId: string, actorId: string, actorRole: string) {
    const refund = await this.getRefund(refundId);

    if (refund.status !== 'REQUESTED' && refund.status !== 'REVIEWING') {
      throw new BadRequestException(
        `Only a REQUESTED or REVIEWING refund can be approved (current: ${refund.status})`,
      );
    }

    const required = this.requiredRoleFor(refund.amount);

    if (actorRole !== 'SUPER_ADMIN' && actorRole !== required) {
      throw new BadRequestException(
        `Approving a refund of ${refund.amount.toString()} requires the ${required} role`,
      );
    }

    // Attach the order total so the rejection reason can be surfaced if needed
    // and the reviewer can see why this refund applies to this order.
    if (!refund.order) throw new NotFoundException('Refund is not linked to an order');

    const updated = await this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'APPROVED',
        approvedById: actorId,
        approvedAt: new Date(),
      },
    });

    await this.audit.log({
      actorId,
      action: 'REFUND_APPROVED',
      entityType: 'Refund',
      entityId: refundId,
      before: { status: refund.status },
      after: { status: 'APPROVED', amount: refund.amount.toString() },
    });

    return updated;
  }

  async reject(refundId: string, actorId: string, reason?: string) {
    const refund = await this.getRefund(refundId);

    if (!['REQUESTED', 'REVIEWING'].includes(refund.status)) {
      throw new BadRequestException(
        `Only a REQUESTED or REVIEWING refund can be rejected (current: ${refund.status})`,
      );
    }

    const updated = await this.prisma.refund.update({
      where: { id: refundId },
      data: { status: 'REJECTED', failureReason: reason ?? null },
    });

    await this.audit.log({
      actorId,
      action: 'REFUND_REJECTED',
      entityType: 'Refund',
      entityId: refundId,
      before: { status: refund.status },
      after: { status: 'REJECTED', reason },
    });

    return updated;
  }

  async cancel(refundId: string, actorId: string) {
    const refund = await this.getRefund(refundId);

    if (!['REQUESTED', 'REVIEWING'].includes(refund.status)) {
      throw new BadRequestException(
        `Only a REQUESTED or REVIEWING refund can be cancelled (current: ${refund.status})`,
      );
    }

    return this.prisma.refund.update({
      where: { id: refundId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Executes an approved refund: credits the customer's wallet and posts
   * the ledger entries. The order total is left untouched — the net customer
   * payment is derived, not overwritten.
   */
  async execute(refundId: string, actorId: string) {
    const refund = await this.getRefund(refundId);

    if (refund.status !== 'APPROVED') {
      throw new BadRequestException(
        `Only an APPROVED refund can be executed (current: ${refund.status})`,
      );
    }

    if (!refund.order) {
      throw new BadRequestException('Refund is not linked to an order');
    }

    const userId = refund.order.userId;

    await this.prisma.refund.update({
      where: { id: refundId },
      data: { status: 'PROCESSING' },
    });

    try {
      const transaction = await this.prisma.$transaction(
        async (tx) => {
          // 1. Credit the customer's wallet.
          const wallet = await tx.wallet.upsert({
            where: { userId },
            create: {
              userId,
              balance: refund.amount,
              currency: 'NGN',
              isActive: true,
            },
            update: { balance: { increment: refund.amount } },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'REFUND',
              amount: refund.amount,
              balanceAfter: wallet.balance,
              reference: refund.reference,
              description: `Refund for order ${refund.orderId}`,
              metadata: { refundId: refund.id, orderId: refund.orderId },
            },
          });

          // 2. Ledger: the refund is funded from the platform's cash, but
          //    the seller must not keep the money for goods they did not
          //    hand over. So the refund is split:
          //
          //      DR REFUND_EXPENSE             (the platform's own share)
          //      DR SELLER_PAYABLE             (the seller's share, clawed back)
          //        CR CUSTOMER_WALLET_LIABILITY (the customer now holds it)
          //
          //    Debits and credits both total the refund amount, so the
          //    entry balances. Without the SELLER_PAYABLE leg the seller
          //    would still be paid for a refunded order.
          const sellerShare = await this.sellerShareOfRefund(tx, refund);

          const platformShare = new Decimal(refund.amount).minus(sellerShare);

          const lines: Array<{
            accountCode: string;
            debit?: Decimal;
            credit?: Decimal;
            memo?: string;
          }> = [
            {
              accountCode: AccountCode.REFUND_EXPENSE,
              debit: platformShare,
              memo: `Refund ${refund.reference} — platform share`,
            },
            {
              accountCode: AccountCode.CUSTOMER_WALLET_LIABILITY,
              credit: refund.amount,
              memo: `Refund credited to customer ${userId}`,
            },
          ];

          // Only claw back from sellers when there is a seller share to
          // claw back (platform-owned products have none).
          if (sellerShare.greaterThan(0)) {
            lines.push({
              accountCode: AccountCode.SELLER_PAYABLE,
              debit: sellerShare,
              memo: `Seller share of refund ${refund.reference}`,
            });
          }

          const posted = await this.finance.postTransaction(
            {
              reference: `REFUND_${refund.reference}`,
              type: 'REFUND',
              description: `Refund ${refund.reference} for order ${refund.orderId}`,
              idempotencyKey: `refund_${refund.reference}`,
              createdByUserId: actorId,
              orderId: refund.orderId,
              lines,
            },
            tx,
          );

          // 2b. Record the refund against the seller's settlement and take
          //     it out of the seller's operational balance, so the payout
          //     engine cannot pay out money that was refunded.
          await this.applyRefundToSettlements(tx, refund, sellerShare);

          // 3. Close the refund out.
          const updated = await tx.refund.update({
            where: { id: refundId },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
              financialTransactionId: posted.id,
            },
          });

          // 4. Record the attempt for reconciliation.
          await tx.paymentAttempt.create({
            data: {
              paymentId: refund.paymentId,
              provider: 'wallet',
              amount: refund.amount,
              status: 'SUCCESS',
              metadata: { refundId: refund.id, type: 'REFUND' },
            },
          });

          return updated;
        },
        { maxWait: 10000, timeout: 30000 },
      );

      await this.audit.log({
        actorId,
        action: 'REFUND_COMPLETED',
        entityType: 'Refund',
        entityId: refundId,
        before: { status: 'APPROVED' },
        after: { status: 'COMPLETED', amount: refund.amount.toString() },
      });

      return transaction;
    } catch (error) {
      this.logger.error(
        `Refund execution failed for ${refundId}`,
        error instanceof Error ? error.stack : String(error),
      );

      await this.prisma.refund.update({
        where: { id: refundId },
        data: {
          status: 'FAILED',
          failureReason:
            error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  /**
   * How much of this refund belongs to the sellers rather than the
   * platform. A refund is taken against the order total, which included
   * the seller's goods plus shipping. The sellers' portion is what they
   * would have been paid had the order not been refunded.
   *
   * If the order's settlements have not been built yet (the order failed
   * before settlement), there is no seller share and the platform carries
   * the whole refund.
   */
  private async sellerShareOfRefund(
    tx: Prisma.TransactionClient,
    refund: { amount: Decimal; orderId: string },
  ): Promise<Decimal> {
    const settlements = await tx.sellerSettlement.findMany({
      where: { orderId: refund.orderId },
      select: { netAmount: true, grossAmount: true },
    });

    if (settlements.length === 0) return new Decimal(0);

    // The sellers' combined net on this order, as a share of the order
    // total. Shipping and platform margin belong to the platform.
    const sellerNet = settlements.reduce(
      (sum, s) => sum.plus(s.netAmount),
      new Decimal(0),
    );

    const order = await tx.order.findUnique({
      where: { id: refund.orderId },
      select: { total: true },
    });

    if (!order || new Decimal(order.total).isZero()) return new Decimal(0);

    const ratio = sellerNet.dividedBy(new Decimal(order.total));

    // Never claw back more than the refund itself.
    const share = new Decimal(refund.amount).mul(ratio);
    return share.greaterThan(refund.amount) ? refund.amount : share;
  }

  /**
   * Records the refund against the seller's settlement row and removes it
   * from the seller's available balance. Without this, a refunded order
   * would still be paid out to the seller.
   */
  private async applyRefundToSettlements(
    tx: Prisma.TransactionClient,
    refund: { amount: Decimal; orderId: string; reference: string },
    sellerShare: Decimal,
  ): Promise<void> {
    if (sellerShare.lessThanOrEqualTo(0)) return;

    const settlements = await tx.sellerSettlement.findMany({
      where: { orderId: refund.orderId },
      select: { id: true, sellerId: true, netAmount: true, refunds: true },
    });

    if (settlements.length === 0) return;

    const sellerNet = settlements.reduce(
      (sum, s) => sum.plus(s.netAmount),
      new Decimal(0),
    );

    if (sellerNet.isZero()) return;

    const ratio = sellerShare.dividedBy(sellerNet);

    for (const settlement of settlements) {
      const share = new Decimal(settlement.netAmount).mul(ratio);

      await tx.sellerSettlement.update({
        where: { id: settlement.id },
        data: {
          refunds: { increment: share },
          netAmount: { decrement: share },
        },
      });

      // Take it out of the seller's money that is actually payable. The
      // settlement may still be PENDING (not yet delivered), in which case
      // the pending bucket is the right one.
      await tx.sellerBalance.upsert({
        where: { sellerId: settlement.sellerId },
        create: {
          sellerId: settlement.sellerId,
          pendingAmount: new Decimal(0),
          availableAmount: new Decimal(0).minus(share),
        },
        update: { availableAmount: { decrement: share } },
      });
    }
  }

  private async getRefund(refundId: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
      include: { order: { select: { id: true, userId: true, total: true } } },
    });

    if (!refund) throw new NotFoundException('Refund not found');
    return refund;
  }

  async list(filters: {
    status?: string;
    orderId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const where: Prisma.RefundWhereInput = {
      ...(filters.status
        ? { status: filters.status as Prisma.RefundWhereInput['status'] }
        : {}),
      ...(filters.orderId ? { orderId: filters.orderId } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.refund.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              total: true,
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      }),
      this.prisma.refund.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getOne(refundId: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        order: {
          select: {
            id: true,
            total: true,
            subtotal: true,
            shippingFee: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        payment: { select: { id: true, amount: true, status: true, paystackRef: true } },
        financialTransaction: {
          include: { ledgerEntries: true },
        },
      },
    });

    if (!refund) throw new NotFoundException('Refund not found');
    return refund;
  }
}
