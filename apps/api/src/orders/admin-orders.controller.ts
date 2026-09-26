import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('stats')
  getStats() {
    return this.ordersService.adminStats();
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.adminFindAll(
      status,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get('analytics')
  getAnalytics() {
    return this.ordersService.adminAnalytics();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.adminUpdateStatus(id, dto.status);
  }
}
