import { Module } from '@nestjs/common';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';
import { FinanceModule } from '../finance.module';
import { AuditModule } from '../audit/audit.module';
import { PaystackModule } from '../../orders/paystack.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, FinanceModule, AuditModule, PaystackModule],
  controllers: [PayoutController],
  providers: [PayoutService],
  exports: [PayoutService],
})
export class PayoutModule {}
