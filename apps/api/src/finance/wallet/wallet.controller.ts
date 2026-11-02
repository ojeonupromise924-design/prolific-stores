import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Decimal } from '@prisma/client/runtime/library';
import { WalletMoveDto } from './dto/wallet-move.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('balance')
  @Roles('CUSTOMER', 'ADMIN', 'SUPER_ADMIN')
  balance(@Request() req: AuthenticatedRequest) {
    return this.wallet.getBalance(req.user.id);
  }

  @Post('topup')
  @Roles('ADMIN', 'SUPER_ADMIN')
  topup(@Request() req: AuthenticatedRequest, @Body() body: WalletMoveDto) {
    return this.wallet.topup({
      userId: req.user.id,
      amount: new Decimal(body.amount),
      reference: body.reference,
      description: body.description,
    });
  }

  @Post('pay')
  @Roles('ADMIN', 'SUPER_ADMIN')
  pay(@Request() req: AuthenticatedRequest, @Body() body: WalletMoveDto) {
    return this.wallet.payFromWallet({
      userId: req.user.id,
      amount: new Decimal(body.amount),
      reference: body.reference,
      description: body.description,
    });
  }

  @Post('refund')
  @Roles('ADMIN', 'SUPER_ADMIN')
  refund(@Request() req: AuthenticatedRequest, @Body() body: WalletMoveDto) {
    return this.wallet.refundToWallet({
      userId: req.user.id,
      amount: new Decimal(body.amount),
      reference: body.reference,
      description: body.description,
    });
  }

  @Get('transactions')
  @Roles('CUSTOMER', 'ADMIN', 'SUPER_ADMIN')
  transactions(
    @Request() req: AuthenticatedRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
    return this.wallet.getTransactions(req.user.id, pageNumber, limitNumber);
  }
}
