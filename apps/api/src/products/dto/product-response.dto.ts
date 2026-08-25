export class ProductImageResponseDto {
  id!: string;

  originalUrl!: string;

  thumbnailUrl!: string;

  mediumUrl!: string;

  largeUrl!: string;

  altText!: string | null;

  isPrimary!: boolean;

  position!: number;
}

export class ProductResponseDto {
  id!: string;

  name!: string;

  slug!: string;

  sku!: string;

  description!: string | null;

  brand!: string | null;

  price!: number;

  comparePrice!: number | null;

  stock!: number;

  isPublished!: boolean;

  isFeatured!: boolean;

  category!: unknown;

  primaryImage!: ProductImageResponseDto | null;

  images!: ProductImageResponseDto[];
}
