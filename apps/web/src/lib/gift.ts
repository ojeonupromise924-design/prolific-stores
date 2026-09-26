import { api } from './api';

export interface SharedWishlistItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  status: 'AVAILABLE' | 'RESERVED' | 'GIFTED';
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string | null;
    price: number;
    comparePrice: number | null;
    images: { url: string; altText: string | null }[];
  };
}

export interface SharedWishlist {
  id: string;
  name: string;
  description: string | null;
  occasion: string;
  customer: { firstName: string };
  items: SharedWishlistItem[];
}

export function getSharedWishlist(shareToken: string) {
  return api.get<SharedWishlist>(`/shared-wishlists/${shareToken}`);
}

export interface GiftReservation {
  id: string;
  wishlistItemId: string;
  expiresAt: string;
}

export function reserveWishlistItem(itemId: string, accessToken: string | null) {
  return api.post<GiftReservation>(`/wishlists/items/${itemId}/reserve`, undefined, accessToken);
}