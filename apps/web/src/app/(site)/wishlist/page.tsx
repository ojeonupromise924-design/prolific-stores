'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Share2,  ShoppingBag, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../../store/auth-store';
import { useWishlistStore, Wishlist } from '../../../store/wishlist-store';
import { ShareWishlistModal } from '../../../components/share-wishlist-modal';
import { getProductVariants } from '@/src/lib/products';
import { useCartStore } from '../../../store/cart-store';



function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

export default function WishlistPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const { addItem, openDrawer } = useCartStore();


  const wishlist = useWishlistStore((s) => s.wishlist);
  const fetchDefault = useWishlistStore((s) => s.fetchDefault);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const share = useWishlistStore((s) => s.share);

  const [activeCategory, setActiveCategory] = useState('All Items');
const [shareUrl, setShareUrl] = useState<string | null>(null);
const [busyItemId, setBusyItemId] = useState<string | null>(null);


  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login?redirect=/wishlist');
      return;
    }
    fetchDefault(accessToken);
  }, [isInitialized, user, accessToken, router, fetchDefault]);

  if (!isInitialized || !user || !wishlist) {
    return <div className="mx-auto max-w-4xl px-6 py-24 text-center text-ink/50">Loading...</div>;
  }

  const categories = [
    'All Items',
    ...Array.from(new Set(wishlist.items.map((i) => i.product.category?.name).filter(Boolean))) as string[],
  ];

  const visibleItems = wishlist.items.filter(
    (item) => activeCategory === 'All Items' || item.product.category?.name === activeCategory,
  );

  async function handleShare() {
    const token = await share(accessToken);
    if (token) {
      setShareUrl(`${window.location.origin}/gift/${token}`);
    }
   }

   async function handleAddToCart(item: Wishlist['items'][number]) {
       setBusyItemId(item.id);
       try {
         let variantId = item.variantId;
         if (!variantId) {
           const variants = await getProductVariants(item.productId);
           const defaultVariant = variants.find((v) => v.isDefault && v.isActive) ?? variants.find((v) => v.isActive);
           if (!defaultVariant) return;
           variantId = defaultVariant.id;
         }
         await addItem(variantId, 1);
         openDrawer();
       } finally {
         setBusyItemId(null);
       }
     }

   return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <div className="rounded-2xl bg-[#f2f5f1] p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <Heart size={24} className="fill-forest text-forest" />
          </span>
          <h1 className="text-3xl font-light text-ink">{wishlist.name}</h1>
        </div>
        <p className="mt-3 text-sm text-ink/60">Save what you love.</p>

        <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-ink/60">
          <span className="font-medium text-ink">{wishlist.items.length} items</span>
          <span>{wishlist.visibility === 'LINK_ONLY' ? '🔗 Shared via link' : '🔒 Private'}</span>
        </div>

               <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink hover:border-forest"
          >
            <ShoppingBag size={16} />
            Add Products
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-medium text-white hover:bg-forest-dark"
          >
            <Share2 size={16} />
            Share Wishlist
          </button>
          <Link
            href="/wishlists"
            className="flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink hover:border-forest"
          >
            View My Wishlists
          </Link>
        </div>
      </div>

      {/* Category filter */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
              activeCategory === cat
                ? 'bg-ink text-white'
                : 'bg-[#f2f5f1] text-ink/60 hover:bg-forest/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="mt-6 flex flex-col gap-3">
        {visibleItems.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink/50">
            {wishlist.items.length === 0
              ? "You haven't saved anything yet."
              : 'No items in this category.'}
          </p>
        ) : (
          visibleItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4"
            >
              <Link
                href={`/shop/${item.product.slug}`}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f2f5f1]"
              >
                {item.product.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.images[0].altText ?? item.product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                {item.product.brand && (
                  <p className="text-xs text-ink/40">{item.product.brand}</p>
                )}
                <Link
                  href={`/shop/${item.product.slug}`}
                  className="mt-0.5 block truncate text-sm font-medium text-ink hover:underline"
                >
                  {item.product.name}
                </Link>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {formatNaira(item.product.price)}
                </p>
                {item.status !== 'AVAILABLE' && (
                  <span className="mt-1 inline-block rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-medium text-forest-dark">
                    {item.status === 'RESERVED' ? 'Reserved by someone' : 'Gifted 🎉'}
                  </span>
                )}
              </div>

              <button
                   type="button"
                   onClick={() => handleAddToCart(item)}
                    disabled={busyItemId === item.id}
                    className="shrink-0 rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-dark     disabled:cursor-not-allowed disabled:opacity-50"
                    >
              {busyItemId === item.id ? 'Adding...' : 'Add to Cart'}
              </button>


                            <button
                onClick={() => {
                  if (confirm(`Remove "${item.product.name}" from your wishlist?`)) {
                    removeItem(item.id, accessToken);
                  }
                }}
                title="Remove from wishlist"
                aria-label="Remove from wishlist"
                className="shrink-0 rounded-full p-2 text-ink/40 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {shareUrl && (
        <ShareWishlistModal shareUrl={shareUrl} onClose={() => setShareUrl(null)} />
      )}
    </div>
  );
}