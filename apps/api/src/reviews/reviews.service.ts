import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  private async hasVerifiedPurchase(userId: string, productId: string) {
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        variant: { productId },
        order: {
          userId,
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
    });
    return Boolean(orderItem);
  }

  async create(userId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.prisma.review.findUnique({
      where: { productId_userId: { productId: dto.productId, userId } },
    });
    if (existing) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const isVerifiedPurchase = await this.hasVerifiedPurchase(
      userId,
      dto.productId,
    );
    if (!isVerifiedPurchase) {
      throw new ForbiddenException(
        'You can only review products you have purchased',
      );
    }

    return this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        isVerifiedPurchase: true,
      },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }

  async findByProduct(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { productId },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { productId } }),
      this.prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return {
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      summary: {
        averageRating: stats._avg.rating ?? 0,
        totalReviews: stats._count.rating,
      },
    };
  }

  async canReview(userId: string, productId: string) {
    const existing = await this.prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
    });
    if (existing) {
      return { canReview: false, reason: 'already_reviewed' as const };
    }

    const isVerifiedPurchase = await this.hasVerifiedPurchase(
      userId,
      productId,
    );
    if (!isVerifiedPurchase) {
      return { canReview: false, reason: 'not_purchased' as const };
    }

    return { canReview: true, reason: null };
  }

  async remove(userId: string, userRole: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const isOwner = review.userId === userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You cannot delete this review');
    }

    await this.prisma.review.delete({ where: { id: reviewId } });
    return { message: 'Review deleted' };
  }
}
