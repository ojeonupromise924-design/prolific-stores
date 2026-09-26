'use client';

import { Heart } from 'lucide-react';
import { useAuthStore } from '../store/auth-store';
import { useWishlistStore } from '../store/wishlist-store';
import { useRouter } from 'next/navigation';

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(productId));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/login?redirect=/');
      return;
    }
    toggleWishlist(productId, accessToken);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={className ?? 'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white'}
    >
      <Heart
        size={16}
        className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-ink/60'}
      />
    </button>
  );
}