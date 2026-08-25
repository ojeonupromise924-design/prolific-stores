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

@Module({
  imports: [
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
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
