import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
  Patch,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Decimal } from '@prisma/client/runtime/library';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER', 'ADMIN', 'SUPER_ADMIN')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('balance')
  balance(@Request() req: AuthenticatedRequest) {
    return this.wallet.getBalance(req.user.id);
  }

  @Post('topup')
  topup(
    @Request() req: AuthenticatedRequest,
    @Body() body: { amount: string; reference: string; description?: string },
  ) {
    return this.wallet.topup({
      userId: req.user.id,
      amount: new Decimal(body.amount),
      reference: body.reference,
      description: body.description,
    });
  }

  @Post('pay')
  pay(
    @Request() req: AuthenticatedRequest,
    @Body() body: { amount: string; reference: string; description?: string },
  ) {
    return this.wallet.payFromWallet({
      userId: req.user.id,
      amount: new Decimal(body.amount),
      reference: body.reference,
      description: body.description,
    });
  }

  @Post('refund')
  refund(
    @Request() req: AuthenticatedRequest,
    @Body() body: { amount: string; reference: string; description?: string },
  ) {
    return this.wallet.refundToWallet({
      userId: req.user.id,
      amount: new Decimal(body.amount),
      reference: body.reference,
      description: body.description,
    });
  }

  @Get('transactions')
  transactions(
    @Request() req: AuthenticatedRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.wallet.getTransactions(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }
}
