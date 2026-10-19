import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaystackService } from './paystack.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { MailModule } from '../mail/mail.module';
import { AdminOrdersController } from './admin-orders.controller';
import { WishlistModule } from '../wishlist/wishlist.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    PrismaModule,
    CartModule,
    MailModule,
    WishlistModule,
    FinanceModule,
  ],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService, PaystackService],
})
export class OrdersModule {}
