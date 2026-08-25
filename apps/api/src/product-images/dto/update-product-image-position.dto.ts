import { IsInt, Min } from 'class-validator';

export class UpdateProductImagePositionDto {
  @IsInt()
  @Min(0)
  position!: number;
}
