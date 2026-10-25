import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';

/**
 * The Paystack gateway lives in its own module so that both the orders
 * module and the finance module can use it. Keeping it separate avoids a
 * circular dependency: OrdersModule already imports FinanceModule, so
 * FinanceModule must not import OrdersModule back.
 */
@Module({
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaystackModule {}
