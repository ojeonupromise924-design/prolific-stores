import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Patch,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { createHmac } from 'crypto';
import type { Request } from 'express';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateOrderAddressDto } from './dto/update-order-address.dto';

interface AuthenticatedRequest extends Request {
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

  @UseGuards(JwtAuthGuard)
  @Get('verify/:reference')
  verifyPayment(@Param('reference') reference: string) {
    return this.ordersService.confirmPayment(reference);
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
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const expectedSignature = createHmac('sha512', secret)
      .update(req.rawBody ?? Buffer.from(''))
      .digest('hex');

    if (signature !== expectedSignature) {
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
