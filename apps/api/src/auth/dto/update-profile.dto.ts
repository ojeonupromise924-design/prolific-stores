import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  firstName?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  lastName?: string;
}
