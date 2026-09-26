import { Controller, Get, Param } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('shared-wishlists')
export class PublicWishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get(':shareToken')
  getByToken(@Param('shareToken') shareToken: string) {
    return this.wishlistService.getByShareToken(shareToken);
  }
}
