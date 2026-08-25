export class ProductVariantResponseDto {
  id!: string;

  productId!: string;

  name!: string;

  sku!: string;

  price!: number;

  comparePrice!: number | null;

  stock!: number;

  isDefault!: boolean;

  isActive!: boolean;

  createdAt!: Date;

  updatedAt!: Date;
}
