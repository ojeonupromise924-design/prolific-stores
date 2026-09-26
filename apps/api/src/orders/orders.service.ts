import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { PaystackService } from './paystack.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderAddressDto } from './dto/update-order-address.dto';
import { MailService } from '../mail/mail.service';
import { orderConfirmationTemplate } from '../mail/templates/order-confirmation.template';
import { WishlistService } from '../wishlist/wishlist.service';

const FREE_SHIPPING_THRESHOLD = 25000;
const FLAT_SHIPPING_FEE = 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly paystackService: PaystackService,
    private readonly mailService: MailService,
    private readonly wishlistService: WishlistService,
  ) {}

  private readonly orderWithItemsInclude = {
    items: {
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true } as const, take: 1 },
              },
            },
          },
        },
        giftReservation: {
          include: {
            wishlistItem: {
              include: {
                wishlist: {
                  include: {
                    customer: { select: { firstName: true, lastName: true } },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  async createOrder(userId: string, dto: CreateOrderDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cart = await this.cartService.getCart(userId, undefined);

    if (!cart.id || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    // Re-validate every item against live stock/availability —
    // never trust the cart snapshot blindly at checkout time.
    for (const item of cart.items) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant || !variant.isActive || !variant.product.isPublished) {
        throw new BadRequestException(
          `"${item.variant.product.name}" is no longer available`,
        );
      }

      if (item.quantity > variant.stock) {
        throw new BadRequestException(
          `Only ${variant.stock} item(s) of "${variant.product.name}" are available`,
        );
      }
    }

    const subtotal = cart.subtotal;
    const shippingFee =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
    const total = subtotal + shippingFee;

    const reference = randomBytes(10).toString('hex');

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          subtotal,
          shippingFee,
          total,
          fullName: dto.fullName,
          phone: dto.phone,
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2,
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode,
          paystackRef: reference,
        },
      });

      await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          orderId: created.id,
          variantId: item.variantId,
          productName: item.variant.product.name,
          variantName: item.variant.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          giftReservationId: item.giftReservationId,
        })),
      });

      return created;
    });

    const paystackData = await this.paystackService.initializeTransaction({
      email: user.email,
      amountInKobo: Math.round(total * 100),
      reference,
      callbackUrl: `${FRONTEND_URL}/checkout/callback`,
    });

    return {
      orderId: order.id,
      reference,
      authorizationUrl: paystackData.authorization_url,
    };
  }

  /**
   * Confirms payment with Paystack and finalizes the order.
   * Safe to call multiple times (from both the frontend redirect
   * AND the webhook) — already-paid orders are skipped.
   */
  async confirmPayment(reference: string) {
    const order = await this.prisma.order.findUnique({
      where: { paystackRef: reference },
      include: { items: true, user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found for this reference');
    }

    // Idempotency: already processed, nothing to do.
    if (order.status === 'PAID') {
      return order;
    }

    const verification =
      await this.paystackService.verifyTransaction(reference);

    if (verification.status !== 'success') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      });
      throw new BadRequestException(
        `Payment was not successful: ${verification.gateway_response}`,
      );
    }

    // Sanity check: paid amount must match what we expect.
    const expectedKobo = Math.round(Number(order.total) * 100);
    if (verification.amount !== expectedKobo) {
      throw new BadRequestException('Payment amount mismatch');
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const result = await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() },
      });

      const activeCart = await tx.cart.findFirst({
        where: { userId: order.userId, status: 'ACTIVE' },
      });

      if (activeCart) {
        await tx.cartItem.deleteMany({ where: { cartId: activeCart.id } });
      }

      return result;
    });

    // Complete any gift reservations this order fulfills.
    for (const item of order.items) {
      if (item.giftReservationId) {
        await this.wishlistService.completeReservation(
          item.giftReservationId,
          order.id,
        );
      }
    }

    // Send confirmation email — outside the transaction, and
    // deliberately non-blocking (mailService.send never throws).
    void this.mailService.send({
      to: order.user.email,
      subject: `Your Prolific Store order is confirmed`,
      html: orderConfirmationTemplate({
        customerName: order.user.firstName,
        orderId: order.id,
        items: order.items.map((i) => ({
          productName: i.productName,
          variantName: i.variantName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        })),
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        total: Number(order.total),
        addressLine1: order.addressLine1,
        addressLine2: order.addressLine2,
        city: order.city,
        state: order.state,
      }),
    });

    return updatedOrder;
  }

  async findAllForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: this.orderWithItemsInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: this.orderWithItemsInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException(
        `Orders that are ${order.status.toLowerCase()} can no longer be cancelled`,
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: this.orderWithItemsInclude,
    });
  }

  async updateAddress(
    userId: string,
    orderId: string,
    dto: UpdateOrderAddressDto,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException(
        'The delivery address can no longer be changed for this order',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: dto,
      include: this.orderWithItemsInclude,
    });
  }

  async retryPayment(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'This order has already been paid or is no longer pending',
      );
    }

    // Paystack requires a unique reference on every initialize call —
    // generate a fresh one and update the order to track it, since
    // confirmPayment/webhook lookups key off paystackRef.
    const newReference = randomBytes(10).toString('hex');

    await this.prisma.order.update({
      where: { id: order.id },
      data: { paystackRef: newReference },
    });

    const paystackData = await this.paystackService.initializeTransaction({
      email: order.user.email,
      amountInKobo: Math.round(Number(order.total) * 100),
      reference: newReference,
      callbackUrl: `${FRONTEND_URL}/checkout/callback`,
    });

    return { authorizationUrl: paystackData.authorization_url };
  }

  async adminFindAll(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as never } : {};

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          ...this.orderWithItemsInclude,
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminUpdateStatus(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as never },
      include: this.orderWithItemsInclude,
    });
  }

  async adminStats() {
    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
      totalCustomers,
    ] = await this.prisma.$transaction([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'PAID' } }),
      this.prisma.order.count({ where: { status: 'PROCESSING' } }),
      this.prisma.order.count({ where: { status: 'SHIPPED' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      this.prisma.order.aggregate({
        where: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    const recentOrders = await this.prisma.order.findMany({
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: Number(revenueResult._sum.total ?? 0),
      totalCustomers,
      recentOrders,
    };
  }

  async adminAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
      },
      include: {
        items: {
          include: {
            variant: { include: { product: { include: { category: true } } } },
          },
        },
      },
    });

    const revenueByDay = new Map<string, number>();
    const ordersByDay = new Map<string, number>();
    const categoryRevenue = new Map<string, number>();
    const brandRevenue = new Map<string, number>();

    for (const order of orders) {
      const day = order.createdAt.toISOString().slice(0, 10);
      revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + Number(order.total));
      ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);

      for (const item of order.items) {
        const lineTotal = Number(item.unitPrice) * item.quantity;
        const categoryName =
          item.variant.product.category?.name ?? 'Uncategorized';
        const brandName = item.variant.product.brand ?? 'Unbranded';
        categoryRevenue.set(
          categoryName,
          (categoryRevenue.get(categoryName) ?? 0) + lineTotal,
        );
        brandRevenue.set(
          brandName,
          (brandRevenue.get(brandName) ?? 0) + lineTotal,
        );
      }
    }

    const sortByValueDesc = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    return {
      revenueByDay: Array.from(revenueByDay.entries())
        .map(([date, revenue]) => ({
          date,
          revenue,
          orders: ordersByDay.get(date) ?? 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      topCategories: sortByValueDesc(categoryRevenue),
      topBrands: sortByValueDesc(brandRevenue),
    };
  }
}
