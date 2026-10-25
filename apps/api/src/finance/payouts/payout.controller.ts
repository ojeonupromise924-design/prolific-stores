import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { PayoutService } from './payout.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/roles.decorator';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

@Controller('admin/finance/payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.payoutService.listBatches({
      status,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.payoutService.getBatchDetail(id);
  }

  @Post()
  buildBatch(@Request() req: AuthenticatedRequest) {
    return this.payoutService.buildBatch(req.user.id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.payoutService.approve(id, req.user.id);
  }

  @Post(':id/process')
  process(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.payoutService.process(id, req.user.id);
  }
}
