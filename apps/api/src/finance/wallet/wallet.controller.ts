import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Decimal } from '@prisma/client/runtime/library';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get('balance')
  async balance(@Request() req: AuthenticatedRequest) {
    return this.wallet.getBalance(req.user.id);
  }

  @Post('topup')
  async topup(
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
  async pay(
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

  @Post('refund') // <-- ADD THIS
  async refund(
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
  async transactions(
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
