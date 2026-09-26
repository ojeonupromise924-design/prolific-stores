'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { StorefrontProduct } from '../lib/types';
import type { ProductVariantOption } from '../lib/products';
import { useCartStore } from '../store/cart-store';
import { Accordion } from './accordion';
import { WishlistButton } from './wishlist-button';
import { ProductReviews } from './product-reviews';

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

export function ProductDetail({
  product,
  variants,
}: {
  product: StorefrontProduct;
  variants: ProductVariantOption[];
}) {
  const activeVariants = variants.filter((v) => v.isActive);
  const defaultVariant =
    activeVariants.find((v) => v.isDefault) ?? activeVariants[0] ?? null;

  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id ?? ''
  );
  const [quantity, setQuantity] = useState(1);
    const [status, setStatus] = useState<'idle' | 'adding' | 'added' | 'error'>('idle');

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const selectedVariant =
    activeVariants.find((v) => v.id === selectedVariantId) ?? null;
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayComparePrice =
    selectedVariant?.comparePrice ?? product.comparePrice;
  const hasDiscount =
    displayComparePrice && displayComparePrice > displayPrice;

  async function handleAddToBag() {
    if (!selectedVariant) return;

    setStatus('adding');

    try {
      await addItem(selectedVariant.id, quantity);
      setStatus('added');
      openDrawer();
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
        {/* Gallery */}
        <div className="grid grid-cols-2 gap-2">
          {product.images.length === 0 ? (
            <div className="col-span-2 flex aspect-4/5 items-center justify-center rounded-2xl bg-[#f2f5f1] text-sm text-ink/30">
              No image yet
            </div>
          ) : (
            product.images.slice(0, 5).map((img, i) => (
              <div
                key={img.id}
                className={`overflow-hidden rounded-2xl bg-[#f2f5f1] ${
                  i === 0 ? 'col-span-2 aspect-4/3' : 'aspect-square'
                }`}
              >
                <Image
                  src={img.largeUrl}
                  alt={img.altText ?? product.name}
                  width={900}
                  height={i === 0 ? 675 : 450}
                  className="h-full w-full object-cover"
                  priority={i === 0}
                />
              </div>
            ))
          )}
        </div>

        {/* Sticky info panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {product.brand && (
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
              {product.brand}
            </p>
          )}

          <h1 className="mt-1 text-3xl font-light text-ink">
            {product.name}
          </h1>
          
           <div className="mt-2">
            <WishlistButton
              productId={product.id}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink/70 hover:border-forest"
            />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-ink">
              {formatNaira(displayPrice)}
            </span>

            {hasDiscount && (
              <>
                <span className="text-base text-ink/40 line-through">
                  {formatNaira(displayComparePrice!)}
                </span>

                <span className="rounded-full bg-clay/10 px-2 py-0.5 text-xs font-medium text-clay">
                  Save {formatNaira(displayComparePrice! - displayPrice)}
                </span>
              </>
            )}
          </div>

          <p className="mt-6 text-sm leading-6 text-ink/60">
            {product.description}
          </p>

          {activeVariants.length === 0 ? (
            <p className="mt-8 rounded-lg bg-[#f2f5f1] px-4 py-3 text-sm text-ink/60">
              This product isn&apos;t available for purchase yet.
            </p>
          ) : (
            <>
              {activeVariants.length > 1 && (
                <div className="mt-8">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">
                    Size
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {activeVariants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setStatus('idle');
                        }}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          v.id === selectedVariantId
                            ? 'border-forest bg-forest/10 text-forest-dark'
                            : 'border-line text-ink/70 hover:border-forest/40'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-line px-2 py-1">
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    className="h-7 w-7 rounded-full text-sm hover:bg-black/5"
                  >
                    −
                  </button>

                  <span className="w-6 text-center text-sm">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(
                          selectedVariant?.stock ?? 1,
                          q + 1
                        )
                      )
                    }
                    className="h-7 w-7 rounded-full text-sm hover:bg-black/5"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToBag}
                  disabled={!selectedVariant || status === 'adding'}
                  className="flex-1 rounded-full bg-forest py-3 text-sm font-medium text-white transition hover:bg-forest-dark disabled:opacity-50"
                >
                  {status === 'adding'
                    ? 'Adding...'
                    : status === 'added'
                      ? 'Added ✓'
                      : 'Add to bag'}
                </button>
              </div>

              {status === 'error' && (
                <p className="mt-3 text-sm text-red-600">
                  Couldn&apos;t add to bag — it may be out of stock.
                </p>
              )}

              
            </>
          )}

          <div className="mt-10">
            <Accordion
              items={[
                {
                  title: 'Product Description',
                  content: product.description,
                },
                {
                  title: 'Shipping & Returns',
                  content:
                    'Orders are typically delivered within 2-5 business days within Nigeria. We offer a 14-day return or exchange window on unopened products.',
                },
                {
                  title: 'Details & Care',
                  content:
                    'Store in a cool, dry place away from direct sunlight. Patch test before first use. Discontinue use if irritation occurs.',
                },
                {
                  title: 'FAQ',
                  content:
                    'How long does delivery take? Most orders arrive within 2-5 business days. What is your return policy? We accept returns within 14 days of delivery for unopened products.',
                },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl">
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}