import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AddWishlistItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
