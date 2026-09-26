'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/auth-store';
import { useCartStore } from '../store/cart-store';
import { cancelOrder, retryPayment, type Order } from '../lib/orders';

export function OrderActions({ order, onUpdate }: { order: Order; onUpdate: (o: Order) => void }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [isBusy, setIsBusy] = useState(false);

  async function handleCancel() {
    if (!confirm('Cancel this order?')) return;
    setIsBusy(true);
    try {
      const updated = await cancelOrder(order.id, accessToken);
      onUpdate(updated);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRetryPayment() {
    setIsBusy(true);
    try {
      const { authorizationUrl } = await retryPayment(order.id, accessToken);
      window.location.href = authorizationUrl;
    } finally {
      setIsBusy(false);
    }
  }

  async function handleBuyAgain() {
    setIsBusy(true);
    try {
      for (const item of order.items) {
        if (item.variant?.id) {
          await addItem(item.variant.id, item.quantity).catch(() => {});
        }
      }
      openDrawer();
    } finally {
      setIsBusy(false);
    }
  }

  if (order.status === 'PENDING') {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleRetryPayment}
          disabled={isBusy}
          className="rounded-full bg-forest px-4 py-2 text-xs font-medium text-white hover:bg-forest-dark disabled:opacity-50"
        >
          Change Payment Method
        </button>
        <button
          onClick={handleCancel}
          disabled={isBusy}
          className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:border-red-400 hover:text-red-600"
        >
          Cancel Order
        </button>
                <Link
          href={`/account/orders/${order.id}?edit=address`}
          className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:border-forest"
        >
          Change Address
        </Link>
        <button
          onClick={handleBuyAgain}
          disabled={isBusy}
          className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:border-forest"
        >
          Buy This Again
        </button>
      </div>
    );
  }

  if (['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
    return (
      <div className="flex flex-wrap gap-2">
        {order.status === 'DELIVERED' ? (
          <button
            disabled
            title="Reviews are coming soon"
            className="rounded-full bg-forest/40 px-4 py-2 text-xs font-medium text-white"
          >
            Leave a Review
          </button>
        ) : (
          <Link
            href={`/account/orders/${order.id}`}
            className="rounded-full bg-forest px-4 py-2 text-xs font-medium text-white hover:bg-forest-dark"
          >
            Track Order
          </Link>
        )}
        <button
          onClick={handleBuyAgain}
          disabled={isBusy}
          className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:border-forest"
        >
          Buy This Again
        </button>
        <button
          disabled
          title="Returns are coming soon"
          className="rounded-full border border-line/50 px-4 py-2 text-xs font-medium text-ink/40"
        >
          Return/Refund
        </button>
      </div>
    );
  }

  return null;
}