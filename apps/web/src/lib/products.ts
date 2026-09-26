import type { ProductListResponse, StorefrontProduct } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface ProductQuery {
  featured?: boolean;
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc';
  limit?: number;
  page?: number;
  category?: string;
  search?: string;
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  if (query.featured !== undefined) params.set('featured', String(query.featured));
  if (query.sort) params.set('sort', query.sort);
  if (query.limit) params.set('limit', String(query.limit));
  if (query.page) params.set('page', String(query.page));
  if (query.category) params.set('category', query.category);
  if (query.search) params.set('search', query.search);

  const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
    // Revalidate periodically rather than caching forever or refetching every request
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  const body = await res.json();
  return body.data as ProductListResponse;
}

export async function getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch product');
  const body = await res.json();
  return body.data as StorefrontProduct;
}

export interface ProductVariantOption {
  id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  isDefault: boolean;
  isActive: boolean;
}

export async function getProductVariants(productId: string): Promise<ProductVariantOption[]> {
  const res = await fetch(`${API_BASE_URL}/product-variants/product/${productId}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const body = await res.json();
  return body.data as ProductVariantOption[];
}