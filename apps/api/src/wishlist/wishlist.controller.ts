import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  list(@Request() req: AuthenticatedRequest) {
    return this.wishlistService.listWishlists(req.user.id);
  }

  @Get('default')
  getDefault(@Request() req: AuthenticatedRequest) {
    return this.wishlistService.getOrCreateDefaultWishlist(req.user.id);
  }

  @Get('default/ids')
  getDefaultIds(@Request() req: AuthenticatedRequest) {
    return this.wishlistService.getDefaultWishlistProductIds(req.user.id);
  }

  @Post('default/toggle/:productId')
  toggleDefault(
    @Request() req: AuthenticatedRequest,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.toggleDefaultWishlist(req.user.id, productId);
  }

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateWishlistDto) {
    return this.wishlistService.createWishlist(req.user.id, dto);
  }

  @Get(':id')
  getOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.wishlistService.getWishlist(req.user.id, id);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.wishlistService.deleteWishlist(req.user.id, id);
  }

  @Post(':id/items')
  addItem(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AddWishlistItemDto,
  ) {
    return this.wishlistService.addItem(req.user.id, id, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.wishlistService.removeItem(req.user.id, id, itemId);
  }

  @Post(':id/share')
  share(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.wishlistService.makeShareable(req.user.id, id);
  }

  @Post(':id/unshare')
  unshare(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.wishlistService.revokeSharing(req.user.id, id);
  }

  @Post('items/:itemId/reserve')
  reserve(
    @Request() req: AuthenticatedRequest,
    @Param('itemId') itemId: string,
  ) {
    return this.wishlistService.reserveItem(req.user.id, itemId);
  }

  @Post('reservations/:reservationId/cancel')
  cancelReservation(
    @Request() req: AuthenticatedRequest,
    @Param('reservationId') reservationId: string,
  ) {
    return this.wishlistService.cancelReservation(req.user.id, reservationId);
  }
}
