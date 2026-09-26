import { api } from './api';
import type { Order, OrderStatus } from './orders';

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: { id: string; total: string; status: OrderStatus; user: { firstName: string; lastName: string } }[];
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