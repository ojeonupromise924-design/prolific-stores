import { api } from './api';
import type { Wishlist } from '../store/wishlist-store';

export interface WishlistSummary {
  id: string;
  name: string;
  occasion: string;
  visibility: 'PRIVATE' | 'LINK_ONLY';
  shareToken: string | null;
  itemCount: number;
  giftedCount: number;
  reservedCount: number;
  availableCount: number;
}

export function listWishlists(accessToken: string | null) {
  return api.get<WishlistSummary[]>('/wishlists', accessToken);
}

export function getWishlistById(id: string, accessToken: string | null) {
  return api.get<Wishlist>(`/wishlists/${id}`, accessToken);
}

export interface CreateWishlistPayload {
  name: string;
  occasion?: string;
  visibility?: 'PRIVATE' | 'LINK_ONLY';
  description?: string;
}

export function createWishlist(payload: CreateWishlistPayload, accessToken: string | null) {
  return api.post<WishlistSummary>('/wishlists', payload, accessToken);
}

export function removeWishlistItem(wishlistId: string, itemId: string, accessToken: string | null) {
  return api.delete(`/wishlists/${wishlistId}/items/${itemId}`, accessToken);
}

export function shareWishlist(wishlistId: string, accessToken: string | null) {
  return api.post<{ shareToken: string }>(`/wishlists/${wishlistId}/share`, undefined, accessToken);
}