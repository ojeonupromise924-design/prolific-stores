import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateProductVariantDto) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: createDto.productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingSku = await this.prisma.productVariant.findUnique({
      where: {
        sku: createDto.sku,
      },
    });

    if (existingSku) {
      throw new ConflictException(
        'A product variant with this SKU already exists',
      );
    }

    if (createDto.isDefault) {
      await this.prisma.productVariant.updateMany({
        where: {
          productId: createDto.productId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.productVariant.create({
      data: {
        productId: createDto.productId,
        name: createDto.name,
        sku: createDto.sku,
        price: createDto.price,
        comparePrice: createDto.comparePrice ?? null,
        stock: createDto.stock ?? 0,
        isDefault: createDto.isDefault ?? false,
        isActive: createDto.isActive ?? true,
      },
    });
  }

  async findAllByProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.productVariant.findMany({
      where: {
        productId,
      },
      orderBy: [
        {
          isDefault: 'desc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });
  }

  async findOne(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: {
        id,
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return variant;
  }

  async update(id: string, updateDto: UpdateProductVariantDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: {
        id,
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (updateDto.sku && updateDto.sku !== variant.sku) {
      const existingSku = await this.prisma.productVariant.findUnique({
        where: {
          sku: updateDto.sku,
        },
      });

      if (existingSku) {
        throw new ConflictException(
          'A product variant with this SKU already exists',
        );
      }
    }

    if (updateDto.isDefault === true) {
      await this.prisma.productVariant.updateMany({
        where: {
          productId: variant.productId,
          id: {
            not: id,
          },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.productVariant.update({
      where: {
        id,
      },
      data: updateDto,
    });
  }

  async remove(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: {
        id,
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    await this.prisma.productVariant.delete({
      where: {
        id,
      },
    });

    return {
      id,
      deleted: true,
    };
  }
}
