import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CommissionService } from '../commissions/commission.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface OrderSplit {
  itemsTotal: Decimal;
  platformSalesTotal: Decimal;
  commissionTotal: Decimal;
  sellerNetTotal: Decimal;
}

interface SplittableOrder {
  id: string;
  items: Array<{
    sellerId: string | null;
    unitPrice: Decimal | number | string;
    quantity: number;
  }>;
}

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    private readonly commissionService: CommissionService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Must be called inside the payment transaction. Creates one settlement
   * per seller on the order and returns the split the ledger needs.
   */
  async createForOrder(
    tx: Prisma.TransactionClient,
    order: SplittableOrder,
  ): Promise<OrderSplit> {
    const sellerGross = new Map<string, Decimal>();
    let platformSalesTotal = new Decimal(0);
    let itemsTotal = new Decimal(0);

    for (const item of order.items) {
      const line = new Decimal(item.unitPrice).mul(item.quantity);
      itemsTotal = itemsTotal.plus(line);

      if (item.sellerId) {
        sellerGross.set(
          item.sellerId,
          (sellerGross.get(item.sellerId) ?? new Decimal(0)).plus(line),
        );
      } else {
        platformSalesTotal = platformSalesTotal.plus(line);
      }
    }

    let commissionTotal = new Decimal(0);
    let sellerNetTotal = new Decimal(0);

    if (sellerGross.size > 0) {
      const sellers = await tx.seller.findMany({
        where: { id: { in: Array.from(sellerGross.keys()) } },
      });
      const sellerById = new Map(sellers.map((s) => [s.id, s]));

      for (const [sellerId, gross] of sellerGross) {
        const seller = sellerById.get(sellerId);
        if (!seller) {
          throw new BadRequestException(
            `Seller ${sellerId} on this order no longer exists`,
          );
        }

        const { commission, net } = this.commissionService.calculate(
          gross,
          seller.commissionRate,
        );

        await tx.sellerSettlement.create({
          data: {
            sellerId,
            orderId: order.id,
            grossAmount: gross,
            commission,
            netAmount: net,
            // Not payable until the order is delivered; eligibleAt is set by
            // markEligible() when that happens.
            status: seller.isActive ? 'PENDING' : 'ON_HOLD',
          },
        });

        await tx.sellerBalance.upsert({
          where: { sellerId },
          create: { sellerId, pendingAmount: net },
          update: { pendingAmount: { increment: net } },
        });

        commissionTotal = commissionTotal.plus(commission);
        sellerNetTotal = sellerNetTotal.plus(net);
      }
    }

    return { itemsTotal, platformSalesTotal, commissionTotal, sellerNetTotal };
  }

  /**
   * Promotes a settlement from PENDING to ELIGIBLE and moves the money from
   * the seller's pending bucket into their available bucket.
   *
   * This is the single place where money becomes payable. It is deliberately
   * NOT derived from `order.status === 'DELIVERED'` at read time — a
   * settlement that has been promoted stays promoted even if the order is
   * later edited, and a settlement is only ever promoted once.
   *
   * Safe to call twice: the second call is a no-op.
   */
  async markEligible(
    orderId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const run = async (client: Prisma.TransactionClient) => {
      const settlements = await client.sellerSettlement.findMany({
        where: { orderId, status: 'PENDING', eligibleAt: null },
      });

      if (settlements.length === 0) return 0;

      for (const settlement of settlements) {
        await client.sellerSettlement.update({
          where: { id: settlement.id },
          data: { status: 'ELIGIBLE', eligibleAt: new Date() },
        });

        // Pending -> Available on the operational balance. The ledger
        // (SELLER_PAYABLE) is untouched: this is only a bucket move.
        await client.sellerBalance.update({
          where: { sellerId: settlement.sellerId },
          data: {
            pendingAmount: { decrement: settlement.netAmount },
            availableAmount: { increment: settlement.netAmount },
          },
        });
      }

      return settlements.length;
    };

    if (tx) return run(tx);
    return this.prisma.$transaction(run, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  /**
   * Safety net for the event-driven path. The primary trigger is the order
   * reaching DELIVERED, but if that event was missed (a failed update, a
   * crashed process, a manually edited order) the settlement would sit in
   * PENDING forever and the seller would never be paid.
   *
   * This sweep promotes any settlement whose order is already delivered.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async sweepUnpromotedSettlements(): Promise<void> {
    try {
      const candidates = await this.prisma.sellerSettlement.findMany({
        where: { status: 'PENDING', eligibleAt: null, orderId: { not: null } },
        select: { orderId: true },
        take: 500,
      });

      let promoted = 0;

      for (const candidate of candidates) {
        const order = await this.prisma.order.findUnique({
          where: { id: candidate.orderId! },
          select: { status: true },
        });

        if (order?.status !== 'DELIVERED') continue;

        try {
          const count = await this.markEligible(candidate.orderId!);
          promoted += count;
        } catch (error) {
          // One bad settlement must not block every settlement after it
          this.logger.error(
            `Could not promote settlements for order ${candidate.orderId}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      if (promoted > 0) {
        this.logger.log(
          `Settlement sweep promoted ${promoted} settlement(s) to ELIGIBLE`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Settlement eligibility sweep failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Moves eligible settlements into PROCESSING when they are pulled into a
   * payout batch. Called by the payout engine.
   */
  async markProcessing(
    tx: Prisma.TransactionClient,
    settlementIds: string[],
  ): Promise<void> {
    if (settlementIds.length === 0) return;
    await tx.sellerSettlement.updateMany({
      where: { id: { in: settlementIds } },
      data: { status: 'PROCESSING' },
    });
  }

  /**
   * Returns settlements to the available bucket when a payout for them fails.
   * The seller's money must never be silently lost — a failed disbursement
   * puts the money back where it can be retried.
   *
   * Balance flow: PENDING -> (eligible) -> AVAILABLE -> (batch built)
   * -> PROCESSING -> COMPLETED, or back to AVAILABLE if the payout fails.
   */
  async releaseToAvailable(
    tx: Prisma.TransactionClient,
    settlements: Array<{ id: string; sellerId: string; netAmount: Decimal }>,
  ): Promise<void> {
    for (const settlement of settlements) {
      await tx.sellerSettlement.update({
        where: { id: settlement.id },
        data: { status: 'ELIGIBLE' },
      });

      await tx.sellerBalance.update({
        where: { sellerId: settlement.sellerId },
        data: {
          availableAmount: { increment: settlement.netAmount },
        },
      });
    }
  }
}
