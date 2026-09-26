import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WishlistOccasion, WishlistVisibility } from '@prisma/client';

export class CreateWishlistDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WishlistOccasion)
  occasion?: WishlistOccasion;

  @IsOptional()
  @IsEnum(WishlistVisibility)
  visibility?: WishlistVisibility;
}
