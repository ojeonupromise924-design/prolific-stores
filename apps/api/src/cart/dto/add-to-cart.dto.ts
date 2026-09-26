import { IsInt, IsNotEmpty, IsString, Min, IsOptional } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @IsOptional()
  @IsString()
  giftReservationId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
