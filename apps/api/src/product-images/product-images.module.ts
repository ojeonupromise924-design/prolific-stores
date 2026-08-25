import { Module } from '@nestjs/common';

import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';

import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ProductImagesController],
  providers: [ProductImagesService],
})
export class ProductImagesModule {}
