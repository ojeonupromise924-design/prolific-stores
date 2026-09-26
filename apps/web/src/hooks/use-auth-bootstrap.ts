'use client';

import { useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth-store';
import { useCartStore } from '../store/cart-store';
import type { User } from '../lib/types';
import { useWishlistStore } from '../store/wishlist-store';

// Module-level flag survives Strict Mode's mount/unmount/remount cycle
// in dev, unlike a component-scoped ref.
let hasBootstrapped = false;

export function useAuthBootstrap() {
  const silentRefresh = useAuthStore((s) => s.silentRefresh);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    if (hasBootstrapped) return;
    hasBootstrapped = true;

    async function bootstrap() {
      const accessToken = await silentRefresh();

      if (accessToken) {
        try {
          const user = await api.get<User>('/auth/profile', accessToken);
          useAuthStore.setState({ user });
          // Fetch the wishlist now that the user and access token are ready
          await useWishlistStore.getState().fetchDefault(accessToken);
        } catch {
          useAuthStore.setState({ user: null, accessToken: null });
        }
      }

      await fetchCart();
    }

    void bootstrap();
  }, [silentRefresh, fetchCart]); // <--- Added the missing closure and dependencies array

  return { isInitialized };
}
