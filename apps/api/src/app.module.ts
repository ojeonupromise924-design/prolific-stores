import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductVariantsModule } from './product-variants/product-variants.module';
import { CartModule } from './cart/cart.module';

import { ScheduleModule } from '@nestjs/schedule';
import { OrdersModule } from './orders/orders.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute per IP, globally
      },
    ]),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    ProductImagesModule,
    CloudinaryModule,
    ProductVariantsModule,
    CartModule,
    OrdersModule,
    WishlistModule,
    ReviewsModule,
  ],

  controllers: [AppController],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
})
export class AppModule {}
