import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find the active cart belonging to either:
   * - an authenticated user
   * - a guest token
   */
  private async findActiveCart(userId?: string, guestToken?: string) {
    if (userId) {
      return this.prisma.cart.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
      });
    }

    if (guestToken) {
      return this.prisma.cart.findFirst({
        where: {
          guestToken,
          status: 'ACTIVE',
        },
      });
    }

    return null;
  }

  /**
   * Create a new cart for either a logged-in customer or a guest.
   */
  private async getOrCreateActiveCart(userId?: string, guestToken?: string) {
    const existingCart = await this.findActiveCart(userId, guestToken);

    if (existingCart) {
      return existingCart;
    }

    if (!userId && !guestToken) {
      throw new BadRequestException('A user ID or guest token is required');
    }

    return this.prisma.cart.create({
      data: {
        userId: userId ?? null,
        guestToken: guestToken ?? null,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Get the current cart.
   */
  async getCart(userId?: string, guestToken?: string) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        status: 'ACTIVE',
        ...(userId
          ? { userId }
          : guestToken
            ? { guestToken }
            : { id: 'non-existent-cart' }),
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!cart) {
      return {
        id: null,
        status: 'ACTIVE',
        items: [],
        subtotal: 0,
        itemCount: 0,
      };
    }

    const subtotal = cart.items.reduce((total, item) => {
      return total + Number(item.unitPrice) * item.quantity;
    }, 0);

    const itemCount = cart.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    return {
      ...cart,
      subtotal,
      itemCount,
    };
  }

  /**
   * Add a product variant to the cart.
   *
   * If the variant already exists in the cart,
   * increase its quantity instead of creating
   * another CartItem.
   */
  async addItem(
    userId: string | undefined,
    guestToken: string | undefined,
    dto: AddToCartDto,
  ) {
    const variant = await this.prisma.productVariant.findUnique({
      where: {
        id: dto.variantId,
      },
      include: {
        product: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (!variant.isActive) {
      throw new BadRequestException(
        'This product variant is currently unavailable',
      );
    }

    if (!variant.product.isPublished) {
      throw new BadRequestException('This product is currently unavailable');
    }

    if (variant.stock <= 0) {
      throw new BadRequestException('This product is currently out of stock');
    }

    if (dto.quantity > variant.stock) {
      throw new BadRequestException(
        `Only ${variant.stock} item(s) are available in stock`,
      );
    }

    const cart = await this.getOrCreateActiveCart(userId, guestToken);

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: dto.variantId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;

      if (newQuantity > variant.stock) {
        throw new BadRequestException(
          `Only ${variant.stock} item(s) are available in stock`,
        );
      }

      return this.prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: newQuantity,

          // We deliberately refresh the current
          // price for now.
          unitPrice: variant.price,
        },
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: dto.variantId,
        quantity: dto.quantity,
        unitPrice: variant.price,
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Update quantity of an existing cart item.
   */
  async updateItem(
    userId: string | undefined,
    guestToken: string | undefined,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          status: 'ACTIVE',
          ...(userId
            ? { userId }
            : guestToken
              ? { guestToken }
              : { id: 'non-existent-cart' }),
        },
      },
      include: {
        variant: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (!item.variant.isActive) {
      throw new BadRequestException(
        'This product variant is currently unavailable',
      );
    }

    if (item.variant.stock <= 0) {
      throw new BadRequestException('This product is currently out of stock');
    }

    if (dto.quantity > item.variant.stock) {
      throw new BadRequestException(
        `Only ${item.variant.stock} item(s) are available in stock`,
      );
    }

    return this.prisma.cartItem.update({
      where: {
        id: item.id,
      },
      data: {
        quantity: dto.quantity,
        unitPrice: item.variant.price,
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Remove a single cart item.
   */
  async removeItem(
    userId: string | undefined,
    guestToken: string | undefined,
    itemId: string,
  ) {
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          status: 'ACTIVE',
          ...(userId
            ? { userId }
            : guestToken
              ? { guestToken }
              : { id: 'non-existent-cart' }),
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: {
        id: item.id,
      },
    });

    return {
      success: true,
      message: 'Cart item removed successfully',
    };
  }

  /**
   * Remove every item from the active cart.
   */
  async clearCart(userId?: string, guestToken?: string) {
    const cart = await this.findActiveCart(userId, guestToken);

    if (!cart) {
      return {
        success: true,
        message: 'Cart is already empty',
      };
    }

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return {
      success: true,
      message: 'Cart cleared successfully',
    };
  }

  async mergeGuestCart(userId: string, guestToken?: string) {
    if (!guestToken) {
      return {
        success: true,
        message: 'No guest cart to merge',
        mergedItems: 0,
      };
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Find the active guest cart
      const guestCart = await tx.cart.findFirst({
        where: {
          guestToken,
          status: 'ACTIVE',
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      // Nothing to merge
      if (!guestCart || guestCart.items.length === 0) {
        return {
          success: true,
          message: 'Guest cart is empty',
          mergedItems: 0,
        };
      }

      // 2. Validate every guest cart item BEFORE changing anything
      for (const guestItem of guestCart.items) {
        const variant = guestItem.variant;

        // Product/variant availability
        if (!variant.isActive) {
          throw new BadRequestException(
            `The product variant "${variant.name}" is no longer available`,
          );
        }

        if (!variant.product.isPublished) {
          throw new BadRequestException(
            `The product "${variant.product.name}" is no longer available`,
          );
        }

        // Stock validation
        if (variant.stock <= 0) {
          throw new BadRequestException(
            `The product "${variant.product.name}" is out of stock`,
          );
        }

        if (guestItem.quantity > variant.stock) {
          throw new BadRequestException(
            `Only ${variant.stock} item(s) are available for "${variant.name}"`,
          );
        }
      }

      // 3. Find the customer's active cart
      let customerCart = await tx.cart.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
      });

      // 4. Create customer cart if one doesn't exist
      if (!customerCart) {
        customerCart = await tx.cart.create({
          data: {
            userId,
            guestToken: null,
            status: 'ACTIVE',
          },
        });
      }

      let mergedItems = 0;

      // 5. Merge guest items into customer cart
      for (const guestItem of guestCart.items) {
        const variant = guestItem.variant;

        const existingItem = await tx.cartItem.findUnique({
          where: {
            cartId_variantId: {
              cartId: customerCart.id,
              variantId: guestItem.variantId,
            },
          },
        });

        // Current price from database
        const currentPrice = variant.price;

        if (existingItem) {
          const newQuantity = existingItem.quantity + guestItem.quantity;

          // IMPORTANT:
          // Existing customer quantity + guest quantity
          // must never exceed current stock.
          if (newQuantity > variant.stock) {
            throw new BadRequestException(
              `Cannot merge "${variant.name}". You already have ${existingItem.quantity} in your cart and only ${variant.stock} item(s) are currently available.`,
            );
          }

          await tx.cartItem.update({
            where: {
              id: existingItem.id,
            },
            data: {
              quantity: newQuantity,

              // Always use the CURRENT database price.
              unitPrice: currentPrice,
            },
          });
        } else {
          // Guest quantity itself must not exceed stock.
          if (guestItem.quantity > variant.stock) {
            throw new BadRequestException(
              `Cannot merge "${variant.name}". Only ${variant.stock} item(s) are currently available.`,
            );
          }

          await tx.cartItem.create({
            data: {
              cartId: customerCart.id,
              variantId: guestItem.variantId,
              quantity: guestItem.quantity,

              // Always use CURRENT database price.
              unitPrice: currentPrice,
            },
          });
        }

        mergedItems++;
      }

      // 6. Convert the guest cart after successful merge
      await tx.cart.update({
        where: {
          id: guestCart.id,
        },
        data: {
          status: 'CONVERTED',
          guestToken: null,
        },
      });

      return {
        success: true,
        message: 'Guest cart merged successfully',
        mergedItems,
        customerCartId: customerCart.id,
      };
    });
  }

  /**
   * Expire carts that have been inactive for 30 days.
   *
   * Only ACTIVE carts are affected.
   * CONVERTED and already ABANDONED carts remain unchanged.
   */
  async expireInactiveCarts() {
    const expirationDate = new Date();

    expirationDate.setDate(expirationDate.getDate() - 30);

    const result = await this.prisma.cart.updateMany({
      where: {
        status: 'ACTIVE',
        updatedAt: {
          lt: expirationDate,
        },
      },
      data: {
        status: 'ABANDONED',
      },
    });

    return {
      success: true,
      message: `${result.count} inactive cart(s) expired successfully`,
      expiredCount: result.count,
    };
  }
}
