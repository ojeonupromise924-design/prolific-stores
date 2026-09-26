'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '../store/cart-store';
import { getProducts, getProductVariants } from '../lib/products';
import type { StorefrontProduct } from '../lib/types';
import Link from 'next/link';
import { useAuthStore } from '../store/auth-store'; 

const FREE_SHIPPING_THRESHOLD = 25000;

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

function cloudinaryThumb(url: string, size = 100) {
  return url.replace('/upload/', `/upload/c_fill,f_auto,h_${size},q_auto,w_${size}/`);
}


export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const cart = useCartStore((s) => s.cart);
  const error = useCartStore((s) => s.error);
  const clearError = useCartStore((s) => s.clearError);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);

  const [crossSell, setCrossSell] = useState<StorefrontProduct[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const cartProductIds = new Set(
      cart.items.map((i) => i.variant.product.id)
    );

    getProducts({ limit: 6 })
      .then(({ data }) => {
        setCrossSell(
          data
            .filter((p) => !cartProductIds.has(p.id))
            .slice(0, 3)
        );
      })
      .catch(() => setCrossSell([]));
  }, [isOpen, cart.items]);

  if (!isOpen) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.subtotal);
  const progress = Math.min(
    100,
    (cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeDrawer}
      />

      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">
            Cart {cart.itemCount > 0 && `(${cart.itemCount})`}
          </h2>

          <button
            onClick={closeDrawer}
            className="text-zinc-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {cart.items.length > 0 && (
          <div className="border-b px-4 py-3">
            {remaining > 0 ? (
              <p className="text-xs text-ink/60">
                Spend{' '}
                <span className="font-medium text-ink">
                  {formatNaira(remaining)}
                </span>{' '}
                more for free shipping!
              </p>
            ) : (
              <p className="text-xs font-medium text-forest-dark">
                You&apos;ve unlocked free shipping!
              </p>
            )}

            <div className="mt-2 h-1.5 w-full rounded-full bg-line">
              <div
                className="h-1.5 rounded-full bg-forest transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start justify-between gap-2 bg-red-50 px-4 py-2 text-sm text-red-700">
            <span>{error}</span>

            <button
              onClick={clearError}
              className="shrink-0 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Your cart is empty.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {cart.items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 border-b pb-4"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f2f5f1]">
                    {item.variant.product.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cloudinaryThumb(item.variant.product.images[0].url, 100)}
                        alt={item.variant.product.images[0].altText ?? item.variant.product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {item.variant.product.name}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {item.variant.name}
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatNaira(Number(item.unitPrice))}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateItem(
                            item.id,
                            item.quantity - 1
                          ).catch(() => {})
                        }
                        disabled={item.quantity <= 1}
                        className="h-7 w-7 rounded border text-sm disabled:opacity-40"
                      >
                        −
                      </button>

                      <span className="w-6 text-center text-sm">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateItem(
                            item.id,
                            item.quantity + 1
                          ).catch(() => {})
                        }
                        disabled={
                          item.quantity >= item.variant.stock
                        }
                        className="h-7 w-7 rounded border text-sm disabled:opacity-40"
                      >
                        +
                      </button>

                      <button
                        onClick={() =>
                          removeItem(item.id).catch(() => {})
                        }
                        className="ml-4 text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {crossSell.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">
                People also bought
              </p>

              <div className="flex gap-3 overflow-x-auto">
                {crossSell.map((p) => (
                  <div
                    key={p.id}
                    className="w-28 shrink-0"
                  >
                    <div className="aspect-square overflow-hidden rounded-lg bg-[#f2f5f1]">
                      {p.primaryImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.primaryImage.thumbnailUrl}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <p className="mt-1.5 line-clamp-2 text-xs text-ink/80">
                      {p.name}
                    </p>

                    <p className="text-xs font-semibold text-ink">
                      {formatNaira(p.price)}
                    </p>

                    <button
                      onClick={async () => {
                        const variants = await getProductVariants(p.id);

                        const defaultVariant =
                          variants.find(
                            (v) => v.isDefault && v.isActive
                          ) ??
                          variants.find(
                            (v) => v.isActive
                          );

                        if (defaultVariant) {
                          addItem(defaultVariant.id, 1).catch(
                            () => {}
                          );
                        }
                      }}
                      className="mt-1.5 w-full rounded-full border border-line py-1 text-[11px] font-medium text-ink hover:border-forest hover:text-forest-dark"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t p-4">
            {(() => {
              const originalTotal = cart.items.reduce((sum, item) => {
                const compareAt = item.variant.comparePrice
                  ? Number(item.variant.comparePrice)
                  : Number(item.unitPrice);

                return sum + compareAt * item.quantity;
              }, 0);

              const savings = originalTotal - cart.subtotal;

              return (
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium">Total:</span>

                  <div className="flex items-center gap-2">
                    {savings > 0 && (
                      <span className="text-sm text-ink/40 line-through">
                        {formatNaira(originalTotal)}
                      </span>
                    )}

                    <span className="text-base font-semibold">
                      {formatNaira(cart.subtotal)}
                    </span>

                    {savings > 0 && (
                      <span className="rounded bg-clay px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        -{formatNaira(savings)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

                          <Link
              href={user ? '/checkout' : '/login?redirect=/checkout'}
              onClick={closeDrawer}
              className="block w-full rounded-full bg-ink py-3 text-center text-sm font-medium text-white hover:bg-forest-dark"
            >
              Checkout Securely
            </Link>

            <button
              onClick={() => clearCart().catch(() => {})}
              className="mt-2 w-full rounded border py-2 text-xs text-zinc-500 hover:bg-zinc-50"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
