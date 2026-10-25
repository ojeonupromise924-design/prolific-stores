import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ReconciliationService } from './reconciliation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/roles.decorator';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

@Controller('admin/finance/reconciliation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get()
  getLatest() {
    return this.reconciliationService.getLatest();
  }

  @Post('run')
  run(@Request() req: AuthenticatedRequest) {
    return this.reconciliationService.run({ actorId: req.user.id });
  }

  @Get('exceptions')
  exceptions(@Query('page') page = '1', @Query('limit') limit = '50') {
    return this.reconciliationService.listExceptions({
      page: Number(page),
      limit: Number(limit),
    });
  }
}
