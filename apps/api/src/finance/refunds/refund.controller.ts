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
import { RefundService } from './refund.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Decimal } from '@prisma/client/runtime/library';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

@Controller('admin/finance/refunds')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('orderId') orderId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.refundService.list({
      status,
      orderId,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.refundService.getOne(id);
  }

  @Post()
  request(
    @Request() req: AuthenticatedRequest,
    @Body() body: {
      orderId: string;
      amount: string;
      reason: string;
    },
  ) {
    return this.refundService.request({
      orderId: body.orderId,
      amount: new Decimal(body.amount),
      reason: body.reason,
      requestedById: req.user.id,
    });
  }

  @Post(':id/start-review')
  startReview(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.refundService.startReview(id, req.user.id);
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.refundService.approve(id, req.user.id, req.user.role);
  }

  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() body: { reason?: string },
  ) {
    return this.refundService.reject(id, req.user.id, body.reason);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.refundService.cancel(id, req.user.id);
  }

  @Post(':id/execute')
  execute(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.refundService.execute(id, req.user.id);
  }
}
