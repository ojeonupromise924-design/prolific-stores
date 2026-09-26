import { Module } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicWishlistController } from './public-wishlist.controller';
import { WishlistExpirationService } from './wishlist-expiration.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [WishlistController, PublicWishlistController],
  providers: [WishlistService, WishlistExpirationService],
  exports: [WishlistService],
})
export class WishlistModule {}
