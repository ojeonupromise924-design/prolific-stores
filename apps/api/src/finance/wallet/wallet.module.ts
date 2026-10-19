import { Module, forwardRef } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FinanceModule } from '../finance.module'; // for FinanceService

@Module({
  imports: [PrismaModule, forwardRef(() => FinanceModule)],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
