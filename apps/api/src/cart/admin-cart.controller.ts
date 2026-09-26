import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { CartService } from './cart.service';
import { AbandonedCartQueryDto } from './dto/abandoned-cart-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminCartController {
  constructor(private readonly cartService: CartService) {}

  @Post('expire')
  expireInactiveCarts() {
    return this.cartService.expireInactiveCarts();
  }

  @Get('abandoned')
  getAbandonedCarts(@Query() query: AbandonedCartQueryDto) {
    return this.cartService.getAbandonedCarts(query.page, query.limit);
  }

  @Get('abandoned/stats')
  getAbandonedCartStats() {
    return this.cartService.getAbandonedCartStats();
  }
}
