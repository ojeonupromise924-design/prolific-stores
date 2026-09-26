// Mirrors backend Prisma models + TransformInterceptor envelope

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  avatarUrl?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  isPublished: boolean;
  images?: CartProductImage[]; // was ProductImage[] — wrong shape for this context
}
export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: string; // Decimal comes over the wire as a string
  comparePrice: string | null;
  stock: number;
  isActive: boolean;
  isDefault: boolean;
  product: Product;
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  unitPrice: string;
  variant: ProductVariant;
}

export interface Cart {
  id: string | null;
  status: 'ACTIVE' | 'CONVERTED' | 'ABANDONED';
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface LoginResponse {
  access_token: string;
  user: User;
  cartMerge: {
    success: boolean;
    message: string;
    mergedItems: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  altText: string | null;
  isPrimary: boolean;
  position: number;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  brand: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  isPublished: boolean;
  isFeatured: boolean;
  category: Category;
  primaryImage: ProductImage | null;
  images: ProductImage[];
}

export interface ProductListResponse {
  data: StorefrontProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CartProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  position: number;
}