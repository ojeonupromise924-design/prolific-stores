import { ProductVariant } from '@prisma/client';
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';

export class ProductVariantMapper {
  static toResponse(variant: ProductVariant): ProductVariantResponseDto {
    return {
      id: variant.id,
      productId: variant.productId,
      name: variant.name,
      sku: variant.sku,
      price: Number(variant.price),
      comparePrice:
        variant.comparePrice !== null ? Number(variant.comparePrice) : null,
      stock: variant.stock,
      isDefault: variant.isDefault,
      isActive: variant.isActive,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }
}
