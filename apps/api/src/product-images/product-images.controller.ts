/// <reference types="multer" />

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProductImagePositionDto } from './dto/update-product-image-position.dto';

@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(
    @Body()
    dto: CreateProductImageDto,
  ) {
    return this.productImagesService.create(dto);
  }

  @Get('product/:productId')
  findByProduct(
    @Param('productId')
    productId: string,
  ) {
    return this.productImagesService.findByProduct(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/primary')
  setPrimary(@Param('id') id: string) {
    return this.productImagesService.setPrimary(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.productImagesService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only JPEG, PNG and WebP images are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('productId') productId: string,
    @Body('altText') altText?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    return this.productImagesService.upload(file.buffer, productId, altText);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/position')
  updatePosition(
    @Param('id') id: string,
    @Body() dto: UpdateProductImagePositionDto,
  ) {
    return this.productImagesService.updatePosition(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('product/:productId/normalize')
  normalizePositions(@Param('productId') productId: string) {
    return this.productImagesService.normalizeExisting(productId);
  }
}
