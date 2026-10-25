import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommissionService } from './commissions/commission.service';
import { SettlementService } from './settlements/settlement.service';

/**
 * The core of the money layer: the double-entry ledger, commission
 * calculation, and the settlement state machine.
 *
 * This module deliberately does NOT import WalletModule, RefundModule,
 * PayoutModule or ReconciliationModule. Those modules depend on it (they
 * post to the ledger), so importing them back here would create a cycle.
 * They are wired at the AppModule level instead.
 */
@Module({
  imports: [PrismaModule],
  controllers: [FinanceController],
  providers: [FinanceService, CommissionService, SettlementService],
  exports: [FinanceService, CommissionService, SettlementService],
})
export class FinanceModule {}
