import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';

import { CreateProductDto } from './dto/create-product.dto';

import { UpdateProductDto } from './dto/update-product.dto';

import { ProductQueryDto } from './dto/product-query.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @UseGuards(
    JwtAuthGuard,

    RolesGuard,
  )
  @Roles('ADMIN')
  @Post()
  create(
    @Body()
    dto: CreateProductDto,
  ) {
    return this.productsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  adminFindAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.productsService.adminFindAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.productsService.publish(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.productsService.unpublish(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/feature')
  feature(@Param('id') id: string) {
    return this.productsService.feature(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/unfeature')
  unfeature(@Param('id') id: string) {
    return this.productsService.unfeature(id);
  }

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.productsService.remove(id);
  }
}
