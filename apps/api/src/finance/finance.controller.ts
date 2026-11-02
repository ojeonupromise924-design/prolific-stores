import {
  Controller,
  BadRequestException,
  NotFoundException,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

@Controller('admin/finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class FinanceController {
  constructor(
    private finance: FinanceService,
    private prisma: PrismaService,
  ) {}

  @Get('trial-balance')
  trialBalance() {
    return this.finance.getTrialBalance();
  }

  @Get('accounts/:code/balance')
  accountBalance(@Param('code') code: string) {
    return this.finance.getAccountBalance(code);
  }

  /**
   * The money dashboard. Every figure here is derived from the ledger, not
   * from order counts — GMV, revenue, cash and seller payable are four
   * different numbers and confusing them is how marketplaces lose money.
   */
  @Get('dashboard')
  async dashboard() {
    const [
      grossMerchandiseValue,
      sellerPayable,
      customerLiability,
      cashPosition,
      pendingSettlements,
      eligibleSettlements,
      processingPayouts,
      openRefunds,
      refundsValue,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
      this.balanceOf('2000'),
      this.balanceOf('2200'),
      this.balanceOf('1100'),
      this.prisma.sellerSettlement.count({ where: { status: 'PENDING' } }),
      this.prisma.sellerSettlement.count({ where: { status: 'ELIGIBLE' } }),
      this.prisma.sellerPayout.count({ where: { status: 'APPROVED' } }),
      this.prisma.refund.count({
        where: { status: { in: ['REQUESTED', 'REVIEWING', 'APPROVED'] } },
      }),
      this.prisma.refund.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    const commissionRevenue = await this.balanceOf('4000');
    const shippingRevenue = await this.balanceOf('4500');
    const productSalesRevenue = await this.balanceOf('4400');
    const processingExpense = await this.balanceOf('5000');

    return {
      grossMerchandiseValue: Number(grossMerchandiseValue._sum.total ?? 0),
      revenue: {
        commission: Number(commissionRevenue),
        shipping: Number(shippingRevenue),
        productSales: Number(productSalesRevenue),
        total: Number(
          commissionRevenue.plus(shippingRevenue).plus(productSalesRevenue),
        ),
      },
      expenses: {
        paymentProcessing: Number(processingExpense),
      },
      sellerPayable: Number(sellerPayable),
      customerLiability: Number(customerLiability),
      cashPosition: Number(cashPosition),
      settlementPipeline: {
        pending: pendingSettlements,
        eligible: eligibleSettlements,
        approvedAwaitingPayout: processingPayouts,
      },
      refunds: {
        open: openRefunds,
        completedValue: Number(refundsValue._sum.amount ?? 0),
      },
    };
  }

  /** Paginated ledger transactions — the full audit trail of money. */
  @Get('transactions')
  async listTransactions(
    @Query('type') type?: string,
    @Query('orderId') orderId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const where = {
      ...(type ? { type: type as never } : {}),
      ...(orderId ? { orderId } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.financialTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        include: {
          ledgerEntries: {
            include: {
              financialAccount: {
                select: { code: true, name: true, type: true },
              },
            },
          },
          order: { select: { id: true, total: true, status: true } },
        },
      }),
      this.prisma.financialTransaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string) {
    const transaction = await this.prisma.financialTransaction.findUnique({
      where: { id },
      include: {
        ledgerEntries: {
          include: {
            financialAccount: {
              select: { code: true, name: true, type: true },
            },
          },
        },
        order: { select: { id: true, total: true, status: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /** A seller's money position: what they are owed, what is payable now. */
  @Get('sellers/:sellerId/balance')
  async sellerBalance(@Param('sellerId') sellerId: string) {
    const [seller, balance, settlements, payouts, pending] = await Promise.all([
      this.prisma.seller.findUnique({
        where: { id: sellerId },
        select: {
          id: true,
          businessName: true,
          businessEmail: true,
          commissionRate: true,
          settlementCycle: true,
          isActive: true,
        },
      }),
      this.prisma.sellerBalance.findUnique({ where: { sellerId } }),
      this.prisma.sellerSettlement.count({
        where: { sellerId, status: 'ELIGIBLE' },
      }),
      this.prisma.sellerPayout.count({
        where: { sellerId, status: 'APPROVED' },
      }),
      this.prisma.sellerSettlement.count({
        where: { sellerId, status: 'PENDING' },
      }),
    ]);

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return {
      seller,
      balance: balance
        ? {
            pending: Number(balance.pendingAmount),
            available: Number(balance.availableAmount),
            paid: Number(balance.paidAmount),
          }
        : { pending: 0, available: 0, paid: 0 },
      settlements: { pending, eligible: settlements },
      payoutsApproved: payouts,
    };
  }

  @Get('sellers/:sellerId/settlements')
  async sellerSettlements(
    @Param('sellerId') sellerId: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const where = {
      sellerId,
      ...(status ? { status: status as never } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.sellerSettlement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        include: {
          order: { select: { id: true, total: true, status: true } },
        },
      }),
      this.prisma.sellerSettlement.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  @Get('sellers/:sellerId/payouts')
  async sellerPayouts(@Param('sellerId') sellerId: string) {
    return this.prisma.sellerPayout.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: {
        batch: { select: { id: true, reference: true, status: true } },
        settlements: {
          include: {
            settlement: {
              select: { id: true, orderId: true, netAmount: true },
            },
          },
        },
      },
    });
  }

  @Post('transactions/manual')
  @Roles('SUPER_ADMIN')
  manualTransaction(
    @Body()
    body: {
      reference: string;
      type: 'TRANSFER' | 'ADJUSTMENT';
      description?: string;
      lines: Array<{
        accountCode: string;
        debit?: string;
        credit?: string;
        memo?: string;
      }>;
    },
    @Request() req: AuthenticatedRequest,
  ) {
    if (body.type !== 'TRANSFER' && body.type !== 'ADJUSTMENT') {
      throw new BadRequestException('type must be TRANSFER or ADJUSTMENT');
    }

    return this.finance.postTransaction({
      ...body,
      createdByUserId: req.user.id,
      lines: body.lines.map((l) => ({
        accountCode: l.accountCode,
        debit: l.debit ? new Decimal(l.debit) : undefined,
        credit: l.credit ? new Decimal(l.credit) : undefined,
        memo: l.memo,
      })),
    });
  }

  /** Signed balance of one ledger account. */
  private async balanceOf(code: string): Promise<Decimal> {
    return this.finance.getAccountBalance(code);
  }
}
