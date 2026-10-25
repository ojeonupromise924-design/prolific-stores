import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaystackModule } from './paystack.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { MailModule } from '../mail/mail.module';
import { AdminOrdersController } from './admin-orders.controller';
import { WishlistModule } from '../wishlist/wishlist.module';
import { FinanceModule } from '../finance/finance.module';
import { WalletModule } from '../finance/wallet/wallet.module';

@Module({
  imports: [
    PrismaModule,
    CartModule,
    MailModule,
    WishlistModule,
    FinanceModule,
    PaystackModule,
    WalletModule,
  ],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
