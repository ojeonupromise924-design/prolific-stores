import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CartService } from './cart.service';

@Injectable()
export class CartExpirationService {
  private readonly logger = new Logger(CartExpirationService.name);

  constructor(private readonly cartService: CartService) {}

  /**
   * Check for inactive carts once every day.
   *
   * The CartService determines which carts have been
   * inactive for more than 30 days.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireInactiveCarts() {
    try {
      const result = await this.cartService.expireInactiveCarts();

      this.logger.log(
        `Cart expiration completed: ${result.expiredCount} cart(s) expired`,
      );
    } catch (error) {
      this.logger.error(
        'Cart expiration job failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
