import { Module, forwardRef } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WalletModule } from './wallet/wallet.module';
import { CommissionService } from './commissions/commission.service';
import { SettlementService } from './settlements/settlement.service';

@Module({
  imports: [PrismaModule, WalletModule, forwardRef(() => WalletModule)],
  controllers: [FinanceController],
  providers: [FinanceService, CommissionService, SettlementService],
  exports: [FinanceService, CommissionService, SettlementService],
})
export class FinanceModule {}
