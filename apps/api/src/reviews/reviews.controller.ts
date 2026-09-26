import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('product/:productId')
  findByProduct(
    @Param('productId') productId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findByProduct(
      productId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('product/:productId/can-review')
  canReview(
    @Request() req: AuthenticatedRequest,
    @Param('productId') productId: string,
  ) {
    return this.reviewsService.canReview(req.user.id, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.reviewsService.remove(req.user.id, req.user.role, id);
  }
}
