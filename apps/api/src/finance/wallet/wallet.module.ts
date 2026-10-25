import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { FinanceModule } from '../finance.module';

@Module({
  imports: [PrismaModule, FinanceModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
