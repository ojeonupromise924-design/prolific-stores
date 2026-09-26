import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from '../prisma/prisma.module';

import { CartExpirationService } from './cart-expiration.service';

import { AdminCartController } from './admin-cart.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CartController, AdminCartController],
  providers: [CartService, CartExpirationService],
  exports: [CartService],
})
export class CartModule {}
