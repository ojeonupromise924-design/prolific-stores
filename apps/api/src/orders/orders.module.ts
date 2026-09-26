import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaystackService } from './paystack.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { MailModule } from '../mail/mail.module';
import { AdminOrdersController } from './admin-orders.controller';
import { WishlistModule } from '../wishlist/wishlist.module';

@Module({
  imports: [PrismaModule, CartModule, MailModule, WishlistModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService, PaystackService],
})
export class OrdersModule {}
