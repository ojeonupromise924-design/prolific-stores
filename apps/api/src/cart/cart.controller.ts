import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

type CartRequest = Request & {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  guestToken?: string;
};

@Controller('cart')
@UseGuards(OptionalJwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: CartRequest) {
    return this.cartService.getCart(req.user?.id, req.guestToken);
  }

  @Post('items')
  addItem(@Req() req: CartRequest, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user?.id, req.guestToken, dto);
  }

  @Patch('items/:itemId')
  updateItem(
    @Req() req: CartRequest,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(
      req.user?.id,
      req.guestToken,
      itemId,
      dto,
    );
  }

  @Delete('items/:itemId')
  removeItem(@Req() req: CartRequest, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(req.user?.id, req.guestToken, itemId);
  }

  @Delete()
  clearCart(@Req() req: CartRequest) {
    return this.cartService.clearCart(req.user?.id, req.guestToken);
  }

  @Post('expire')
  expireInactiveCarts() {
    return this.cartService.expireInactiveCarts();
  }
}
