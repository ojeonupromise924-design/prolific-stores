import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { MailService } from '../mail/mail.service';
import { giftPurchasedTemplate } from '../mail/templates/gift-purchased.template';
import { giftReceivedTemplate } from '../mail/templates/gift-received.template';

@Injectable()
export class WishlistService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private slugify(name: string) {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `${base}-${randomBytes(3).toString('hex')}`;
  }

  private itemInclude() {
    return {
      product: {
        include: {
          category: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
      variant: true,
    };
  }

  async getOrCreateDefaultWishlist(userId: string) {
    let wishlist = await this.prisma.wishlist.findFirst({
      where: { customerId: userId, type: 'PRIVATE', occasion: 'GENERAL' },
      orderBy: { createdAt: 'asc' },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: {
          customerId: userId,
          name: 'My Wishlist',
          slug: this.slugify('my-wishlist'),
          type: 'PRIVATE',
          visibility: 'PRIVATE',
          occasion: 'GENERAL',
        },
      });
    }

    return wishlist;
  }

  async listWishlists(userId: string) {
    const wishlists = await this.prisma.wishlist.findMany({
      where: { customerId: userId },
      include: { items: { select: { status: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return wishlists.map((w) => {
      const total = w.items.length;
      const gifted = w.items.filter((i) => i.status === 'GIFTED').length;
      const reserved = w.items.filter((i) => i.status === 'RESERVED').length;
      return {
        id: w.id,
        name: w.name,
        occasion: w.occasion,
        visibility: w.visibility,
        shareToken: w.shareToken,
        itemCount: total,
        giftedCount: gifted,
        reservedCount: reserved,
        availableCount: total - gifted - reserved,
      };
    });
  }

  async createWishlist(userId: string, dto: CreateWishlistDto) {
    return this.prisma.wishlist.create({
      data: {
        customerId: userId,
        name: dto.name,
        slug: this.slugify(dto.name),
        description: dto.description,
        occasion: dto.occasion ?? 'GENERAL',
        visibility: dto.visibility ?? 'PRIVATE',
        type: dto.visibility === 'LINK_ONLY' ? 'SHARED' : 'PRIVATE',
      },
    });
  }

  async getWishlist(userId: string, wishlistId: string) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id: wishlistId, customerId: userId },
      include: {
        items: { include: this.itemInclude(), orderBy: { addedAt: 'desc' } },
      },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    return wishlist;
  }

  async deleteWishlist(userId: string, wishlistId: string) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id: wishlistId, customerId: userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    await this.prisma.wishlist.delete({ where: { id: wishlistId } });
    return { message: 'Wishlist deleted' };
  }

  async addItem(userId: string, wishlistId: string, dto: AddWishlistItemDto) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id: wishlistId, customerId: userId },
    });
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const existing = await this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
      },
    });

    if (existing) {
      return this.prisma.wishlistItem.update({
        where: { id: existing.id },
        data: {
          quantity: dto.quantity ?? existing.quantity,
          notes: dto.notes ?? existing.notes,
        },
        include: this.itemInclude(),
      });
    }

    return this.prisma.wishlistItem.create({
      data: {
        wishlistId,
        productId: dto.productId,
        variantId: dto.variantId,
        quantity: dto.quantity ?? 1,
        notes: dto.notes,
      },
      include: this.itemInclude(),
    });
  }

  async removeItem(userId: string, wishlistId: string, itemId: string) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id: wishlistId, customerId: userId },
    });
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    await this.prisma.wishlistItem.deleteMany({
      where: { id: itemId, wishlistId },
    });
    return { message: 'Item removed' };
  }

  /**
   * Quick toggle for the header heart icon — adds/removes a product
   * from the user's default wishlist without them managing multiple lists.
   */
  async toggleDefaultWishlist(userId: string, productId: string) {
    const wishlist = await this.getOrCreateDefaultWishlist(userId);

    const existing = await this.prisma.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId, variantId: null },
    });

    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { wishlisted: false };
    }

    await this.prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
    });
    return { wishlisted: true };
  }

  async getDefaultWishlistProductIds(userId: string) {
    const wishlist = await this.getOrCreateDefaultWishlist(userId);
    const items = await this.prisma.wishlistItem.findMany({
      where: { wishlistId: wishlist.id },
      select: { productId: true },
    });
    return items.map((i) => i.productId);
  }

  async makeShareable(userId: string, wishlistId: string) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id: wishlistId, customerId: userId },
    });
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const shareToken = wishlist.shareToken ?? randomBytes(16).toString('hex');

    return this.prisma.wishlist.update({
      where: { id: wishlistId },
      data: {
        shareToken,
        visibility: 'LINK_ONLY',
        type: 'SHARED',
      },
    });
  }

  async revokeSharing(userId: string, wishlistId: string) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id: wishlistId, customerId: userId },
    });
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    return this.prisma.wishlist.update({
      where: { id: wishlistId },
      data: { shareToken: null, visibility: 'PRIVATE', type: 'PRIVATE' },
    });
  }

  /**
   * Public — no auth required. Anyone with the link can view.
   */
  async getByShareToken(shareToken: string) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { shareToken },
      include: {
        customer: { select: { firstName: true } },
        items: {
          include: this.itemInclude(),
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!wishlist) {
      throw new NotFoundException(
        'This wishlist link is invalid or no longer active',
      );
    }

    if (wishlist.expiresAt && wishlist.expiresAt < new Date()) {
      throw new NotFoundException('This wishlist link has expired');
    }

    return wishlist;
  }

  private readonly RESERVATION_HOURS = 24;

  async reserveItem(buyerId: string, wishlistItemId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { id: wishlistItemId },
    });

    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    if (item.status !== 'AVAILABLE') {
      throw new BadRequestException('This item is no longer available to gift');
    }

    const expiresAt = new Date(
      Date.now() + this.RESERVATION_HOURS * 60 * 60 * 1000,
    );

    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.giftReservation.create({
        data: { wishlistItemId, buyerId, expiresAt, status: 'RESERVED' },
      });

      await tx.wishlistItem.update({
        where: { id: wishlistItemId },
        data: { status: 'RESERVED' },
      });

      return reservation;
    });
  }

  async cancelReservation(buyerId: string, reservationId: string) {
    const reservation = await this.prisma.giftReservation.findFirst({
      where: { id: reservationId, buyerId, status: 'RESERVED' },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.giftReservation.update({
        where: { id: reservationId },
        data: { status: 'CANCELLED' },
      });
      await tx.wishlistItem.update({
        where: { id: reservation.wishlistItemId },
        data: { status: 'AVAILABLE' },
      });
    });
  }

  /**
   * Cron-driven: expire reservations whose 24-hour window has passed,
   * releasing the item back to AVAILABLE.
   */
  async expireStaleReservations() {
    const stale = await this.prisma.giftReservation.findMany({
      where: { status: 'RESERVED', expiresAt: { lt: new Date() } },
    });

    for (const reservation of stale) {
      await this.prisma.$transaction([
        this.prisma.giftReservation.update({
          where: { id: reservation.id },
          data: { status: 'EXPIRED' },
        }),
        this.prisma.wishlistItem.update({
          where: { id: reservation.wishlistItemId },
          data: { status: 'AVAILABLE' },
        }),
      ]);
    }

    return { expiredCount: stale.length };
  }

  /**
   * Called by OrdersService when a gift-linked order is confirmed paid.
   * Marks the reservation COMPLETED and the wishlist item GIFTED —
   * this is the ONLY code path that sets GIFTED, per your requirement
   * that it reflect a real completed purchase, never a raw click.
   */
  async completeReservation(reservationId: string, orderId: string) {
    const reservation = await this.prisma.giftReservation.findUnique({
      where: { id: reservationId },
      include: {
        buyer: true,
        wishlistItem: {
          include: {
            product: true,
            variant: true,
            wishlist: { include: { customer: true } },
          },
        },
      },
    });
    if (!reservation) return;

    await this.prisma.$transaction([
      this.prisma.giftReservation.update({
        where: { id: reservationId },
        data: { status: 'COMPLETED', orderId, completedAt: new Date() },
      }),
      this.prisma.wishlistItem.update({
        where: { id: reservation.wishlistItem.id },
        data: { status: 'GIFTED' },
      }),
    ]);

    const buyer = reservation.buyer;
    const recipient = reservation.wishlistItem.wishlist.customer;
    const productName = reservation.wishlistItem.product.name;
    const variantName = reservation.wishlistItem.variant?.name ?? 'Standard';
    const price = Number(
      reservation.wishlistItem.variant?.price ??
        reservation.wishlistItem.product.price,
    );

    if (buyer) {
      void this.mailService.send({
        to: buyer.email,
        subject: `You gifted ${recipient.firstName} something special`,
        html: giftPurchasedTemplate({
          buyerName: buyer.firstName,
          recipientName: recipient.firstName,
          productName,
          variantName,
          price,
          orderId,
        }),
      });
    }

    void this.mailService.send({
      to: recipient.email,
      subject: `${buyer?.firstName ?? 'Someone'} gifted you something 🎉`,
      html: giftReceivedTemplate({
        recipientName: recipient.firstName,
        buyerName: buyer?.firstName ?? 'Someone',
        productName,
        variantName,
      }),
    });
  }
}
