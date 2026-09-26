import { create } from 'zustand';
import { api } from '../lib/api';

export interface WishlistItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  status: 'AVAILABLE' | 'RESERVED' | 'GIFTED';
  addedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string | null;
    price: number;
    comparePrice: number | null;
    category?: { name: string };
    images: { url: string; altText: string | null }[];
  };
}

export interface Wishlist {
  id: string;
  name: string;
  slug: string;
  visibility: 'PRIVATE' | 'LINK_ONLY';
  shareToken: string | null;
  items: WishlistItem[];
}

interface WishlistState {
  wishlist: Wishlist | null;
  productIds: Set<string>;
  isLoading: boolean;

  fetchDefault: (accessToken: string | null) => Promise<void>;
  toggleWishlist: (productId: string, accessToken: string | null) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  removeItem: (itemId: string, accessToken: string | null) => Promise<void>;
  share: (accessToken: string | null) => Promise<string | null>;
  unshare: (accessToken: string | null) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: null,
  productIds: new Set(),
  isLoading: false,

  fetchDefault: async (accessToken) => {
    if (!accessToken) {
      set({ wishlist: null, productIds: new Set() });
      return;
    }
    set({ isLoading: true });
    try {
      const basic = await api.get<{ id: string }>('/wishlists/default', accessToken);
      const full = await api.get<Wishlist>(`/wishlists/${basic.id}`, accessToken);
      set({
        wishlist: full,
        productIds: new Set(full.items.map((i) => i.productId)),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId, accessToken) => {
    if (!accessToken) return;
    try {
      await api.post(`/wishlists/default/toggle/${productId}`, undefined, accessToken);
      await get().fetchDefault(accessToken);
    } catch {
      // no-op
    }
  },

  isWishlisted: (productId) => get().productIds.has(productId),

  removeItem: async (itemId, accessToken) => {
    const wishlist = get().wishlist;
    if (!wishlist || !accessToken) return;
    await api.delete(`/wishlists/${wishlist.id}/items/${itemId}`, accessToken);
    await get().fetchDefault(accessToken);
  },

  share: async (accessToken) => {
    const wishlist = get().wishlist;
    if (!wishlist || !accessToken) return null;
    const updated = await api.post<Wishlist>(`/wishlists/${wishlist.id}/share`, undefined, accessToken);
    set({ wishlist: { ...wishlist, ...updated } });
    return updated.shareToken;
  },

  unshare: async (accessToken) => {
    const wishlist = get().wishlist;
    if (!wishlist || !accessToken) return;
    const updated = await api.post<Wishlist>(`/wishlists/${wishlist.id}/unshare`, undefined, accessToken);
    set({ wishlist: { ...wishlist, ...updated } });
  },
}));