import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductMapper } from './product.mapper';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: dto.categoryId,
      },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const slugExists = await this.prisma.product.findUnique({
      where: {
        slug: dto.slug,
      },
    });

    if (slugExists) {
      throw new BadRequestException('Slug already exists');
    }

    const skuExists = await this.prisma.product.findUnique({
      where: {
        sku: dto.sku,
      },
    });

    if (skuExists) {
      throw new BadRequestException('SKU already exists');
    }

    if (dto.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    if (dto.comparePrice !== undefined && dto.comparePrice < dto.price) {
      throw new BadRequestException('Compare price must be greater than price');
    }

    return this.prisma.product.create({
      data: dto,
    });
  }

  async findAll(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const search = query.search?.trim();
    const category = query.category?.trim();
    const featured = query.featured;
    const published = query.published;
    const sort = query.sort ?? 'newest';

    const skip = (page - 1) * limit;

    let orderBy: Prisma.ProductOrderByWithRelationInput;

    switch (sort) {
      case 'price-asc':
        orderBy = {
          price: 'asc',
        };
        break;

      case 'price-desc':
        orderBy = {
          price: 'desc',
        };
        break;

      case 'oldest':
        orderBy = {
          createdAt: 'asc',
        };
        break;

      case 'newest':
      default:
        orderBy = {
          createdAt: 'desc',
        };
    }

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          slug: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          sku: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          brand: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          description: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    if (published !== undefined) {
      where.isPublished = published;
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          images: {
            orderBy: {
              position: 'asc',
            },
          },
        },
        orderBy,
      }),

      this.prisma.product.count({
        where,
      }),
    ]);

    return {
      data: products.map((product) =>
        ProductMapper.toResponse(product, this.cloudinaryService),
      ),

      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return ProductMapper.toResponse(product, this.cloudinaryService);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check category if changing it
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Check duplicate slug
    if (dto.slug) {
      const slugExists = await this.prisma.product.findUnique({
        where: { slug: dto.slug },
      });

      if (slugExists && slugExists.id !== id) {
        throw new BadRequestException('Slug already exists');
      }
    }

    // Check duplicate SKU
    if (dto.sku) {
      const skuExists = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
      });

      if (skuExists && skuExists.id !== id) {
        throw new BadRequestException('SKU already exists');
      }
    }

    // Validate stock
    if (dto.stock !== undefined && dto.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    // Determine the effective price values
    const price = dto.price ?? Number(product.price);
    const comparePrice =
      dto.comparePrice ??
      (product.comparePrice ? Number(product.comparePrice) : undefined);

    if (comparePrice !== undefined && comparePrice < price) {
      throw new BadRequestException('Compare price must be greater than price');
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Product deleted successfully',
    };
  }

  async publish(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        isPublished: true,
      },
    });
  }

  async unpublish(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        isPublished: false,
      },
    });
  }

  async feature(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        isFeatured: true,
      },
    });
  }

  async unfeature(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        isFeatured: false,
      },
    });
  }
}
