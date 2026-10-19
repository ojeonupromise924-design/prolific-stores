import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CommissionService } from '../commissions/commission.service';

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
  constructor(private readonly commissionService: CommissionService) {}

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
            // Not payable until delivery; eligibleAt is set by a later step.
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
}
