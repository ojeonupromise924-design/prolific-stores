import { Prisma } from '@prisma/client';

import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductImageMapper } from '../product-images/product-image.mapper';
import { ProductResponseDto } from './dto/product-response.dto';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
  };
}>;

export class ProductMapper {
  static toResponse(
    product: ProductWithRelations,
    cloudinary: CloudinaryService,
  ): ProductResponseDto {
    const images = product.images.map((image) =>
      ProductImageMapper.toResponse(image, cloudinary),
    );

    const primaryImage =
      images.find((image) => image.isPrimary) ?? images[0] ?? null;

    return {
      id: product.id,

      name: product.name,

      slug: product.slug,

      sku: product.sku,

      description: product.description,

      brand: product.brand,

      price: Number(product.price),

      comparePrice:
        product.comparePrice !== null ? Number(product.comparePrice) : null,

      stock: product.stock,

      isPublished: product.isPublished,

      isFeatured: product.isFeatured,

      category: product.category,

      primaryImage,

      images,
    };
  }
}
