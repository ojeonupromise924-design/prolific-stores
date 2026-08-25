import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProductImagePositionDto } from './dto/update-product-image-position.dto';
import { ProductImageMapper } from './product-image.mapper';

@Injectable()
export class ProductImagesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateProductImageDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.isPrimary) {
      await this.prisma.productImage.updateMany({
        where: {
          productId: dto.productId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    return this.prisma.productImage.create({
      data: {
        productId: dto.productId,
        url: dto.url,
        publicId: dto.publicId,
        altText: dto.altText,
        isPrimary: dto.isPrimary ?? false,
        position: dto.position ?? 0,
      },
    });
  }

  async findByProduct(productId: string) {
    const images = await this.prisma.productImage.findMany({
      where: {
        productId,
      },
      orderBy: {
        position: 'asc',
      },
    });

    return images.map((image) =>
      ProductImageMapper.toResponse(image, this.cloudinaryService),
    );
  }

  async setPrimary(id: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.prisma.productImage.updateMany({
      where: {
        productId: image.productId,
        isPrimary: true,
      },
      data: { isPrimary: false },
    });

    const updatedImage = await this.prisma.productImage.update({
      where: {
        id,
      },
      data: {
        isPrimary: true,
      },
    });

    return ProductImageMapper.toResponse(updatedImage, this.cloudinaryService);
  }

  async remove(id: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const { productId } = image;

    await this.cloudinaryService.deleteImage(image.publicId);
    await this.prisma.productImage.delete({
      where: { id },
    });

    const existingImages = await this.prisma.productImage.count({
      where: { productId },
    });

    if (existingImages > 0) {
      const primaryImage = await this.prisma.productImage.findFirst({
        where: { productId },
        orderBy: { position: 'asc' },
      });

      if (primaryImage) {
        await this.prisma.productImage.update({
          where: { id: primaryImage.id },
          data: { isPrimary: true },
        });
      }
    }

    return {
      message: 'Image deleted successfully',
      deletedImage: {
        id: image.id,
        publicId: image.publicId,
        productId: image.productId,
      },
    };
  }

  async upload(file: Buffer, productId: string, altText?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      `prolific-store/products/${productId}`,
    );

    const existingImages = await this.prisma.productImage.count({
      where: { productId },
    });

    const isPrimary = existingImages === 0;

    const image = await this.prisma.productImage.create({
      data: {
        productId,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        altText,
        isPrimary,
        position: existingImages,
      },
    });

    return ProductImageMapper.toResponse(image, this.cloudinaryService);
  }

  async updatePosition(id: string, dto: UpdateProductImagePositionDto) {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const oldPosition = image.position;
    const newPosition = dto.position;

    if (oldPosition === newPosition) {
      return image;
    }

    if (newPosition < oldPosition) {
      await this.prisma.productImage.updateMany({
        where: {
          productId: image.productId,
          position: {
            gte: newPosition,
            lt: oldPosition,
          },
        },
        data: { position: { increment: 1 } },
      });
    } else {
      await this.prisma.productImage.updateMany({
        where: {
          productId: image.productId,
          position: {
            gt: oldPosition,
            lte: newPosition,
          },
        },
        data: { position: { decrement: 1 } },
      });
    }

    const updatedImage = await this.prisma.productImage.update({
      where: {
        id,
      },
      data: {
        position: newPosition,
      },
    });

    return ProductImageMapper.toResponse(updatedImage, this.cloudinaryService);
  }
}
