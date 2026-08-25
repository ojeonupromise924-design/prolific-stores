import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProductImageDto {
  @IsUUID()
  productId!: string;

  @IsString()
  url!: string;

  @IsString()
  publicId!: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  isPrimary?: boolean;

  @IsOptional()
  position?: number;
}
