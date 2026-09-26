import { api } from './api';

export interface CreateOrderPayload {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  reference: string;
  authorizationUrl: string;
}

export function createOrder(payload: CreateOrderPayload, accessToken: string | null) {
  return api.post<CreateOrderResponse>('/orders', payload, accessToken);
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export interface OrderItem {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: string;
  variant?: {
    id: string;
    product?: {
      images?: { url: string }[];
    };
  };
  giftReservation?: {
    wishlistItem: {
      wishlist: {
        customer: { firstName: string; lastName: string };
      };
    };
  } | null;
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotal: string;
  shippingFee: string;
  total: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  paidAt: string | null;
  createdAt: string;
  items: OrderItem[];
}

export function verifyPayment(reference: string, accessToken: string | null) {
  return api.get<Order>(`/orders/verify/${reference}`, accessToken);
}

export function getOrders(accessToken: string | null) {
  return api.get<Order[]>('/orders', accessToken);
}

export function getOrderById(id: string, accessToken: string | null) {
  return api.get<Order>(`/orders/${id}`, accessToken);
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
}

export function updateProfile(payload: UpdateProfilePayload, accessToken: string | null) {
  return api.patch('/auth/profile', payload, accessToken);
}

export function cancelOrder(id: string, accessToken: string | null) {
  return api.post<Order>(`/orders/${id}/cancel`, undefined, accessToken);
}

export function retryPayment(id: string, accessToken: string | null) {
  return api.post<{ authorizationUrl: string }>(`/orders/${id}/retry-payment`, undefined, accessToken);
}

export interface UpdateAddressPayload {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
}

export function updateOrderAddress(
  id: string,
  payload: UpdateAddressPayload,
  accessToken: string | null,
) {
  return api.patch<Order>(`/orders/${id}/address`, payload, accessToken);
}

export function getGiftRecipientName(order: Order): string | null {
  const giftItem = order.items.find((i) => i.giftReservation);
  if (!giftItem?.giftReservation) return null;
  const customer = giftItem.giftReservation.wishlistItem.wishlist.customer;
  return `${customer.firstName} ${customer.lastName}`;
}