import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrderAddressDto {
  @IsString() @IsNotEmpty() fullName!: string;
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @IsNotEmpty() addressLine1!: string;
  @IsString() @IsOptional() addressLine2?: string;
  @IsString() @IsNotEmpty() city!: string;
  @IsString() @IsNotEmpty() state!: string;
  @IsString() @IsOptional() postalCode?: string;
}
