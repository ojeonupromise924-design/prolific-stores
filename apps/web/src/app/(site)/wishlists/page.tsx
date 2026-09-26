'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gift, Plus } from 'lucide-react';
import { useAuthStore } from '../../../store/auth-store';
import { listWishlists, createWishlist, type WishlistSummary } from '../../../lib/wishlists';
import { CreateWishlistModal } from '../../../components/create-wishlist-modal';
import type { CreateWishlistPayload } from '../../../lib/wishlists';

export default function WishlistsOverviewPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [wishlists, setWishlists] = useState<WishlistSummary[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login?redirect=/wishlists');
      return;
    }
    listWishlists(accessToken).then(setWishlists).catch(() => {});
  }, [isInitialized, user, accessToken, router]);

  async function handleCreate(name: string, occasion: string) {
    await createWishlist({ name, occasion: occasion as CreateWishlistPayload['occasion'] }, accessToken);
    listWishlists(accessToken).then(setWishlists).catch(() => {});
  }

  if (!isInitialized || !user) {
    return <div className="mx-auto max-w-4xl px-6 py-24 text-center text-ink/50">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light text-ink">My Wishlists</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-dark"
        >
          <Plus size={16} />
          Create Wishlist
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {wishlists.map((w) => {
          const progress = w.itemCount > 0 ? Math.round((w.giftedCount / w.itemCount) * 100) : 0;
          return (
            <Link
              key={w.id}
              href={`/wishlist/list/${w.id}`}
              className="rounded-2xl border border-line bg-white p-6 transition hover:border-forest/40 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest-dark">
                  <Gift size={18} />
                </span>
                <div>
                  <h3 className="font-medium text-ink">{w.name}</h3>
                  <p className="text-xs text-ink/40">{w.occasion.charAt(0) + w.occasion.slice(1).toLowerCase()}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f2f5f1]">
                  <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs font-medium text-ink/60">{progress}%</span>
              </div>

              <div className="mt-3 flex gap-4 text-xs text-ink/50">
                <span>{w.availableCount} available</span>
                <span>{w.reservedCount} reserved</span>
                <span>{w.giftedCount} gifted</span>
              </div>
            </Link>
          );
        })}
      </div>

      {showCreate && (
        <CreateWishlistModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}