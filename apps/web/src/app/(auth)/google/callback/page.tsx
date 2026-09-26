'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/auth-store';
import { useCartStore } from '../../../../store/cart-store';
import type { User } from '../../../../lib/types';
import { showToast } from '@/src/components/toast';


export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    const accessToken = searchParams.get('access_token');

    Promise.resolve()
      .then(() => {
        if (!accessToken) throw new Error('No token received');
        return api.get<User>('/auth/profile', accessToken);
      })
      .then(async (user) => {
        useAuthStore.setState({ user, accessToken });
        showToast(`Welcome back, ${user.firstName}`);
        await fetchCart();
        router.push(searchParams.get('redirect') || '/');
      })
      .catch(() => router.push('/login'));
  }, [searchParams, router, fetchCart]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-ink/50">
      Signing you in...
    </div>
  );
}