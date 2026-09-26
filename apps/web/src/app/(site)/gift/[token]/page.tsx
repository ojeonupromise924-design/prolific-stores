'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Gift, Check, Clock3, Copy } from 'lucide-react';
import { getSharedWishlist, reserveWishlistItem, type SharedWishlist, type SharedWishlistItem } from '../../../../lib/gift';
import { getProductVariants } from '../../../../lib/products';
import { useAuthStore } from '../../../../store/auth-store';
import { useCartStore } from '../../../../store/cart-store';
import { ApiError } from '../../../../lib/api';
import Link from 'next/link';

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

export default function GiftLandingPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const [wishlist, setWishlist] = useState<SharedWishlist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getSharedWishlist(token)
      .then(setWishlist)
      .catch(() => setError('This wishlist link is invalid or no longer active.'));
  }, [token]);

  async function handleGiftThis(item: SharedWishlistItem) {
    if (!user) {
      router.push(`/login?redirect=/gift/${token}`);
      return;
    }

    setBusyItemId(item.id);
    try {
      const reservation = await reserveWishlistItem(item.id, accessToken);

      let variantId = item.variantId;
      if (!variantId) {
        const variants = await getProductVariants(item.productId);
        const defaultVariant = variants.find((v) => v.isDefault && v.isActive) ?? variants.find((v) => v.isActive);
        if (!defaultVariant) {
          throw new Error('This product has no available option to purchase right now.');
        }
        variantId = defaultVariant.id;
      }

      await addItem(variantId, item.quantity, reservation.id);
      openDrawer();

      // Reflect the reservation locally without a full refetch.
      setWishlist((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) => (i.id === item.id ? { ...i, status: 'RESERVED' } : i)),
            }
          : prev,
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not reserve this gift. It may have just been taken.');
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error) {
    return <div className="mx-auto max-w-xl px-6 py-24 text-center text-ink/60">{error}</div>;
  }
  if (!wishlist) {
    return <div className="mx-auto max-w-xl px-6 py-24 text-center text-ink/50">Loading...</div>;
  }

  const giftedCount = wishlist.items.filter((i) => i.status === 'GIFTED').length;
  const progress = wishlist.items.length > 0 ? Math.round((giftedCount / wishlist.items.length) * 100) : 0;

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#f2f5f1] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white px-4 py-1.5 text-xs font-semibold text-forest-dark">
            <Gift size={14} />
            Shared Wishlist
          </span>
          <h1 className="mt-4 text-4xl font-light text-ink">
            {wishlist.customer.firstName}&apos;s {wishlist.occasion !== 'GENERAL' ? wishlist.occasion.charAt(0) + wishlist.occasion.slice(1).toLowerCase() : ''} Wishlist
          </h1>
          {wishlist.description && (
            <p className="mt-4 max-w-xl text-lg text-ink/60">{wishlist.description}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-5 text-sm text-ink/60">
            <span className="font-medium text-ink">{wishlist.items.length} items</span>
            <span>🔗 Anyone with this link can view</span>
          </div>
        </div>
      </section>

      {/* Progress + share */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
          <div className="rounded-2xl border border-forest/20 bg-[#f2f5f1] p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest-dark shadow-sm">
                <Gift size={19} />
              </span>
              <div>
                <p className="font-semibold text-ink">
                  {giftedCount} of {wishlist.items.length} items gifted
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm font-semibold text-ink">{progress}%</span>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <h3 className="font-semibold text-ink">Share this wishlist</h3>
            <p className="mt-1 text-sm text-ink/50">Let friends and family know what they&apos;d love.</p>
            <button
              onClick={handleCopyLink}
              className="mt-4 flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:border-forest"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-2xl font-light text-ink">Wishlist Items</h2>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="aspect-square bg-[#f2f5f1]">
                {item.product.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.images[0].altText ?? item.product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                {item.product.brand && (
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink/40">{item.product.brand}</p>
                )}
                <h3 className="mt-1 line-clamp-2 text-sm font-medium text-ink">{item.product.name}</h3>
                <p className="mt-2 text-sm font-semibold text-ink">{formatNaira(item.product.price)}</p>

                {item.status === 'AVAILABLE' && (
                  <button
                    onClick={() => handleGiftThis(item)}
                    disabled={busyItemId === item.id}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-forest py-2.5 text-xs font-medium text-white hover:bg-forest-dark disabled:opacity-50"
                  >
                    <Gift size={14} />
                    {busyItemId === item.id ? 'Reserving...' : 'Gift This'}
                  </button>
                )}
                {item.status === 'RESERVED' && (
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-full border border-forest/30 bg-forest/5 py-2.5 text-xs font-medium text-forest-dark">
                    <Clock3 size={14} />
                    Reserved
                  </div>
                )}
                {item.status === 'GIFTED' && (
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-forest/10 py-2.5 text-xs font-medium text-forest-dark">
                    <Check size={14} />
                    Already Gifted
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
            {/* Closing CTA */}
      <section className="bg-ink px-6 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-forest">Prolific Store</p>
            <h2 className="mt-2 text-3xl font-light text-white">Discover. Shop. Gift.</h2>
            <p className="mt-2 text-sm text-white/60">The easiest way to share what you love.</p>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-medium text-ink hover:bg-white/90"
          >
            Explore Prolific Store →
          </Link>
        </div>
      </section>
    </div>
  );
}