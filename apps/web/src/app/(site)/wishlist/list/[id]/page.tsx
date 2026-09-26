'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Share2, Trash2, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../../../../../store/auth-store';
import { useCartStore } from '../../../../../store/cart-store';
import { getWishlistById, removeWishlistItem, shareWishlist } from '../../../../../lib/wishlists';
import { getProductVariants } from '../../../../../lib/products';
import type { Wishlist } from '../../../../../store/wishlist-store';
import { ShareWishlistModal } from '../../../../../components/share-wishlist-modal';

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

export default function WishlistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push(`/login?redirect=/wishlist/list/${id}`);
      return;
    }
    getWishlistById(id, accessToken).then(setWishlist).catch(() => {});
  }, [isInitialized, user, accessToken, id, router]);

  async function handleRemove(itemId: string) {
    await removeWishlistItem(id, itemId, accessToken);
    getWishlistById(id, accessToken).then(setWishlist).catch(() => {});
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

  async function handleShare() {
    const result = await shareWishlist(id, accessToken);
    setShareUrl(`${window.location.origin}/gift/${result.shareToken}`);
  }

  if (!wishlist) {
    return <div className="mx-auto max-w-4xl px-6 py-24 text-center text-ink/50">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/wishlists" className="text-sm text-ink/50 hover:text-ink">
        ← My Wishlists
      </Link>

      <div className="mt-4 rounded-2xl bg-[#f2f5f1] p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <Heart size={24} className="fill-forest text-forest" />
          </span>
          <h1 className="text-3xl font-light text-ink">{wishlist.name}</h1>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
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
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {wishlist.items.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink/50">No items in this wishlist yet.</p>
        ) : (
          wishlist.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f2f5f1]">
                {item.product.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.product.images[0].url} alt={item.product.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{item.product.name}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{formatNaira(item.product.price)}</p>
                {item.status !== 'AVAILABLE' && (
                  <span className="mt-1 inline-block rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-medium text-forest-dark">
                    {item.status === 'RESERVED' ? 'Reserved' : 'Gifted 🎉'}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                disabled={busyItemId === item.id || item.status !== 'AVAILABLE'}
                className="shrink-0 rounded-full bg-forest px-4 py-2 text-xs font-medium text-white hover:bg-forest-dark disabled:opacity-40"
              >
                Add to Cart
              </button>
                            <button
                onClick={() => {
                  if (confirm(`Remove "${item.product.name}" from this wishlist?`)) {
                    handleRemove(item.id);
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

      {shareUrl && <ShareWishlistModal shareUrl={shareUrl} onClose={() => setShareUrl(null)} />}
    </div>
  );
}