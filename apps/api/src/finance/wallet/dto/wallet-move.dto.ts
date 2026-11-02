import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class WalletMoveDto {
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'amount must be a positive number with at most 2 decimals',
  })
  amount!: string;

  @IsString()
  @MaxLength(100)
  reference!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
