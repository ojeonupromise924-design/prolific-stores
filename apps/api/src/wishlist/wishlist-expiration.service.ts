import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WishlistService } from './wishlist.service';

@Injectable()
export class WishlistExpirationService {
  private readonly logger = new Logger(WishlistExpirationService.name);

  constructor(private readonly wishlistService: WishlistService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async expireReservations() {
    try {
      const result = await this.wishlistService.expireStaleReservations();
      this.logger.log(
        `Gift reservation expiry: ${result.expiredCount} released`,
      );
    } catch (error) {
      this.logger.error(
        'Gift reservation expiry failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
