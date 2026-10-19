import { BadRequestException, Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

export interface CommissionResult {
  gross: Decimal;
  rate: Decimal;
  commission: Decimal;
  net: Decimal;
}

@Injectable()
export class CommissionService {
  calculate(
    gross: Decimal | number | string,
    rate: Decimal | number | string,
  ): CommissionResult {
    const g = new Decimal(gross);
    const r = new Decimal(rate);

    if (r.isNegative() || r.greaterThan(1)) {
      throw new BadRequestException('Commission rate must be between 0 and 1');
    }

    const commission = g.mul(r).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return { gross: g, rate: r, commission, net: g.minus(commission) };
  }
}
