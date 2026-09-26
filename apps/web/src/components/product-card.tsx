import Link from 'next/link';
import type { StorefrontProduct } from '../lib/types';
import Image from 'next/image';
import { WishlistButton } from './wishlist-button';


function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const image = product.primaryImage;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-white transition hover:border-forest/40 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f2f5f1]">
        {image ? (
          <Image
    src={image.mediumUrl}
    alt={image.altText ?? product.name}
    fill
    sizes="(max-width: 768px) 50vw, 25vw"
    className="object-cover transition duration-500 group-hover:scale-105"/>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink/30">
            No image yet
          </div>
        )}

        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-clay px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Sale
          </span>
        )}
         <div className="absolute right-3 top-3">
          <WishlistButton productId={product.id} />
        </div>
      </div>

      <div className="p-4">
        {product.brand && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink/40">
            {product.brand}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-ink">{product.name}</h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-ink">{formatNaira(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-ink/40 line-through">
              {formatNaira(product.comparePrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}