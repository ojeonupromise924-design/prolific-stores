import { create } from 'zustand';
import { api, registerRefreshHandler } from '../lib/api';
import type { User } from '../lib/types';

interface LoginResponse {
  access_token: string;
  user: User;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  silentRefresh: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isInitialized: false,

    login: async (email, password) => {
    set({ isLoading: true });
    try {
      const result = await api.post<LoginResponse>('/auth/login', { email, password });
      set({ user: result.user, accessToken: result.access_token, isLoading: false });
      return result;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    const { accessToken } = useAuthStore.getState();
    try {
      await api.post('/auth/logout', undefined, accessToken);
    } catch {
      // ignore — token may already be expired
    } finally {
      set({ user: null, accessToken: null });
    }
  },

    silentRefresh: async () => {
    try {
      const result = await api.post<{ access_token: string }>('/auth/refresh', undefined, undefined, true);
      set({ accessToken: result.access_token, isInitialized: true });
      return result.access_token;
    } catch {
      set({ user: null, accessToken: null, isInitialized: true });
      return null;
    }
  },
}));

// Wire the api layer's 401 handler to this store's silentRefresh,
// so any request that gets a 401 transparently retries once with
// a fresh token instead of surfacing the error to the UI.
registerRefreshHandler(() => useAuthStore.getState().silentRefresh());