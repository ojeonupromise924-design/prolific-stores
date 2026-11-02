import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
  Patch,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request as ExpressRequest } from 'express';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateOrderAddressDto } from './dto/update-order-address.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    [key: string]: unknown;
  };
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrder(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, dto);
  }

  /**
   * Read-only payment status. Safe to poll, refresh, or prefetch — it
   * never changes anything.
   */

  @UseGuards(JwtAuthGuard)
  @Get('verify/:reference')
  getPaymentStatus(
    @Req() req: AuthenticatedRequest,
    @Param('reference') reference: string,
  ) {
    return this.ordersService.getPaymentStatus(reference, req.user.id);
  }

  /**
   * Captures the payment. This is a POST because it moves money: a GET
   * that mutates state is a bug waiting to happen (browser prefetch,
   * link previewers, a double refresh). The capture itself is
   * idempotent — the order is claimed inside a transaction, so a repeat
   * call returns the already-paid order instead of charging twice.
   */
  @UseGuards(JwtAuthGuard)
  @Post('verify/:reference')
  verifyPayment(
    @Req() req: AuthenticatedRequest,
    @Param('reference') reference: string,
  ) {
    return this.ordersService.confirmPayment(reference, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.ordersService.findAllForUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.ordersService.findOne(req.user.id, id);
  }

  @Post('webhook/paystack')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<AuthenticatedRequest>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret || !req.rawBody) {
      throw new UnauthorizedException('Webhook cannot be verified');
    }

    const expectedSignature = createHmac('sha512', secret)
      .update(req.rawBody)
      .digest('hex');

    const received = Buffer.from(signature ?? '', 'utf8');
    const expected = Buffer.from(expectedSignature, 'utf8');
    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event = req.body as PaystackWebhookEvent;

    if (event.event === 'charge.success') {
      await this.ordersService.confirmPayment(event.data.reference);
    }

    return { received: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  cancelOrder(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.ordersService.cancelOrder(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/address')
  updateAddress(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateOrderAddressDto,
  ) {
    return this.ordersService.updateAddress(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/retry-payment')
  retryPayment(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.ordersService.retryPayment(req.user.id, id);
  }
}
