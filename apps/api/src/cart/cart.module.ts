import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from '../prisma/prisma.module';

import { CartExpirationService } from './cart-expiration.service';

@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [CartService, CartExpirationService],
  exports: [CartService],
})
export class CartModule {}
