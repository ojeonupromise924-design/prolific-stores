import { create } from 'zustand';
import { api, ApiError } from '../lib/api';
import type { Cart } from '../lib/types';
import { useAuthStore } from './auth-store';

const EMPTY_CART: Cart = {
  id: null,
  status: 'ACTIVE',
  items: [],
  subtotal: 0,
  itemCount: 0,
};

interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
  isDrawerOpen: boolean;

  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number, giftReservationId?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong';
}

export const useCartStore = create<CartState>((set, get) => {
  const token = () => useAuthStore.getState().accessToken;

  return {
    cart: EMPTY_CART,
    isLoading: false,
    error: null,
    isDrawerOpen: false,

    fetchCart: async () => {
      set({ isLoading: true });
      try {
        const cart = await api.get<Cart>('/cart', token());
        set({ cart, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    },

    

    addItem: async (variantId, quantity, giftReservationId) => {
      set({ error: null });
      try {
        await api.post('/cart/items', { variantId, quantity, giftReservationId }, token());
        await get().fetchCart();
      } catch (err) {
        set({ error: errorMessage(err) });
        throw err;
      }
    },

    updateItem: async (itemId, quantity) => {
      set({ error: null });
      try {
        await api.patch(`/cart/items/${itemId}`, { quantity }, token());
        await get().fetchCart();
      } catch (err) {
        set({ error: errorMessage(err) });
        throw err;
      }
    },

    removeItem: async (itemId) => {
      set({ error: null });
      try {
        await api.delete(`/cart/items/${itemId}`, token());
        await get().fetchCart();
      } catch (err) {
        set({ error: errorMessage(err) });
        throw err;
      }
    },

    clearCart: async () => {
      set({ error: null });
      try {
        await api.delete('/cart', token());
        set({ cart: EMPTY_CART });
      } catch (err) {
        set({ error: errorMessage(err) });
        throw err;
      }
    },

    clearError: () => set({ error: null }),
    openDrawer: () => set({ isDrawerOpen: true }),
    closeDrawer: () => set({ isDrawerOpen: false }),
  };
});