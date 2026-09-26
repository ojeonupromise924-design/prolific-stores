import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WishlistVisibility } from '@prisma/client';

export class UpdateWishlistDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WishlistVisibility)
  visibility?: WishlistVisibility;
}
