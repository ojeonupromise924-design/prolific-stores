import { api, uploadFile  } from './api';

import type { Order, OrderStatus } from './orders';

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: {
    id: string;
    total: string;
    status: OrderStatus;
    createdAt: string;
    user: { firstName: string; lastName: string };
  }[];
}

export function getAdminStats(accessToken: string | null) {
  return api.get<AdminStats>('/orders/admin/stats', accessToken);
}

export interface AdminOrderListResponse {
  data: Order[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function getAdminOrders(
  params: { status?: string; page?: number },
  accessToken: string | null,
) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  return api.get<AdminOrderListResponse>(`/orders/admin?${query}`, accessToken);
}

export function updateAdminOrderStatus(
  id: string,
  status: string,
  accessToken: string | null,
) {
  return api.patch<Order>(`/orders/admin/${id}/status`, { status }, accessToken);
}

export interface AdminProduct {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  stock: number;
  isPublished: boolean;
  isFeatured: boolean;
  category: { name: string };
  primaryImage: { thumbnailUrl: string } | null;
}

export function getAdminProducts(page: number, accessToken: string | null) {
  return api.get<{ data: AdminProduct[]; meta: { totalPages: number } }>(
    `/products/admin/all?page=${page}`,
    accessToken,
  );
}

export function togglePublish(id: string, publish: boolean, accessToken: string | null) {
  return api.patch(`/products/${id}/${publish ? 'publish' : 'unpublish'}`, undefined, accessToken);
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  products?: unknown[];
}

export function getCategories(accessToken: string | null) {
  return api.get<Category[]>('/categories', accessToken);
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export function createCategory(payload: CategoryPayload, accessToken: string | null) {
  return api.post<Category>('/categories', payload, accessToken);
}

export function updateCategory(id: string, payload: Partial<CategoryPayload>, accessToken: string | null) {
  return api.patch<Category>(`/categories/${id}`, payload, accessToken);
}

export function deleteCategory(id: string, accessToken: string | null) {
  return api.delete(`/categories/${id}`, accessToken);
}

export interface AdminCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  orderCount: number;
}

export function getAdminCustomers(accessToken: string | null) {
  return api.get<AdminCustomer[]>('/auth/admin/customers', accessToken);
}

export interface AnalyticsData {
  revenueByDay: { date: string; revenue: number; orders: number }[];
  topCategories: { name: string; value: number }[];
  topBrands: { name: string; value: number }[];
}

export function getAnalytics(accessToken: string | null) {
  return api.get<AnalyticsData>('/orders/admin/analytics', accessToken);
}


export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  sku: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  brand: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  category: { id: string; name: string };
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  brand?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  categoryId: string;
}

export function createProduct(payload: CreateProductPayload, accessToken: string | null) {
  return api.post<{ id: string }>('/products', payload, accessToken);
}

export function getAdminProduct(id: string, accessToken: string | null) {
  return api.get<AdminProductDetail>(`/products/${id}`, accessToken);
}

export function deleteProduct(id: string, accessToken: string | null) {
  return api.delete(`/products/${id}`, accessToken);
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface CreateVariantPayload {
  productId: string;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export function getProductVariants(productId: string, accessToken: string | null) {
  return api.get<ProductVariant[]>(`/product-variants/product/${productId}`, accessToken);
}

export function createVariant(payload: CreateVariantPayload, accessToken: string | null) {
  return api.post<ProductVariant>('/product-variants', payload, accessToken);
}

export function deleteVariant(id: string, accessToken: string | null) {
  return api.delete(`/product-variants/${id}`, accessToken);
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  position: number;
}

export function getProductImages(productId: string, accessToken: string | null) {
  return api.get<ProductImage[]>(`/product-images/product/${productId}`, accessToken);
}

export function uploadProductImage(
  productId: string,
  file: File,
  altText: string,
  accessToken: string | null,
) {
  return uploadFile<ProductImage>('/product-images/upload', file, accessToken, { productId, altText });
}

export function setProductImagePrimary(id: string, accessToken: string | null) {
  return api.patch(`/product-images/${id}/primary`, undefined, accessToken);
}

export function deleteProductImage(id: string, accessToken: string | null) {
  return api.delete(`/product-images/${id}`, accessToken);
}

