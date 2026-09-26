'use client';

import { useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth-store';
import type { User } from '../lib/types';

let hasBootstrapped = false;

export function useAuthBootstrap() {
  const silentRefresh = useAuthStore((s) => s.silentRefresh);

  useEffect(() => {
    if (hasBootstrapped) return;
    hasBootstrapped = true;

    async function bootstrap() {
      const accessToken = await silentRefresh();
      if (accessToken) {
        try {
          const user = await api.get<User>('/auth/profile', accessToken);
          useAuthStore.setState({ user });
        } catch {
          useAuthStore.setState({ user: null, accessToken: null });
        }
      }
    }

    void bootstrap();
  }, [silentRefresh]);
}