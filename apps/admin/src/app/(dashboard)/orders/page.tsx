'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/auth-store';
import { getAdminOrders, updateAdminOrderStatus } from '../../../lib/admin';
import type { Order, OrderStatus } from '../../../lib/orders';

function formatNaira(value: string) {
  return `₦${Number(value).toLocaleString()}`;
}

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'];
const EDITABLE_STATUSES = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getAdminOrders({ status: filter || undefined }, accessToken)
      .then((res) => setOrders(res.data))
      .catch(() => {});
  }, [accessToken, filter]);

  async function handleStatusChange(orderId: string, status: string) {
    const updated = await updateAdminOrderStatus(orderId, status, accessToken);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light text-ink">Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-0">
                <td className="p-4">#{order.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-4">{order.fullName}</td>
                <td className="p-4 font-medium">{formatNaira(order.total)}</td>
                <td className="p-4">{order.status}</td>
                <td className="p-4">
                  {EDITABLE_STATUSES.includes(order.status) || order.status === 'PAID' ? (
                    <select
                      defaultValue=""
                      onChange={(e) => e.target.value && handleStatusChange(order.id, e.target.value)}
                      className="rounded-lg border border-line px-2 py-1.5 text-xs"
                    >
                      <option value="" disabled>Change to...</option>
                      {EDITABLE_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-ink/30">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}