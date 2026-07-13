import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';

import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        products: true,
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.slug) {
      const slugExists = await this.prisma.category.findUnique({
        where: {
          slug: dto.slug,
        },
      });

      if (slugExists && slugExists.id !== id) {
        throw new BadRequestException('Slug already exists');
      }
    }

    return this.prisma.category.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.products.length > 0) {
      throw new BadRequestException(
        'Cannot delete category that contains products',
      );
    }

    await this.prisma.category.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Category deleted successfully',
    };
  }
}
