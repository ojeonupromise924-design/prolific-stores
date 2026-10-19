import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Decimal } from '@prisma/client/runtime/library';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

@Controller('admin/finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class FinanceController {
  constructor(private finance: FinanceService) {}

  @Get('trial-balance')
  trialBalance() {
    return this.finance.getTrialBalance();
  }

  @Get('accounts/:code/balance')
  accountBalance(@Param('code') code: string) {
    return this.finance.getAccountBalance(code);
  }

  @Post('transactions/manual')
  manualTransaction(
    @Body()
    body: {
      reference: string;
      type: 'TRANSFER' | 'ADJUSTMENT';
      description?: string;
      lines: Array<{
        accountCode: string;
        debit?: string;
        credit?: string;
        memo?: string;
      }>;
    },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.finance.postTransaction({
      ...body,
      createdByUserId: req.user.id,
      lines: body.lines.map((l) => ({
        accountCode: l.accountCode,
        debit: l.debit ? new Decimal(l.debit) : undefined,
        credit: l.credit ? new Decimal(l.credit) : undefined,
        memo: l.memo,
      })),
    });
  }
}
