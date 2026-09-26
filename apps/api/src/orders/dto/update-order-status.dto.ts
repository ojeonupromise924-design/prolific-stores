import { IsIn, IsNotEmpty } from 'class-validator';

const VALID_STATUSES = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsIn(VALID_STATUSES)
  status!: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}
