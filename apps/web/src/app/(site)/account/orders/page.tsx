'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../store/auth-store';
import { getOrders, type Order, type OrderStatus } from '../../../../lib/orders';
import { OrderActions } from '../../../../components/order-actions';
import { getGiftRecipientName } from '../../../../lib/orders';

function formatNaira(value: string) {
  return `₦${Number(value).toLocaleString()}`;
}

const TABS: { label: string; statuses: OrderStatus[] | null }[] = [
  { label: 'All', statuses: null },
  { label: 'Processing', statuses: ['PENDING', 'PROCESSING'] },
  { label: 'Shipped', statuses: ['SHIPPED'] },
  { label: 'Delivered', statuses: ['DELIVERED', 'PAID'] },
  { label: 'Cancelled', statuses: ['CANCELLED', 'FAILED'] },
];

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-forest/10 text-forest-dark',
  PROCESSING: 'bg-blue-50 text-blue-700',
  SHIPPED: 'bg-blue-50 text-blue-700',
  DELIVERED: 'bg-forest/10 text-forest-dark',
  PENDING: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-red-50 text-red-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export default function OrdersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      router.push('/login?redirect=/account/orders');
      return;
    }

    getOrders(accessToken)
      .then(setOrders)
      .catch(() => setError('Could not load your orders.'));
  }, [isInitialized, user, accessToken, router]);

  if (!isInitialized || (!orders && !error)) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center text-ink/50">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center text-red-600">
        {error}
      </div>
    );
  }

  const activeStatuses = TABS.find((t) => t.label === activeTab)?.statuses;

  const filtered = (orders ?? [])
    .filter((o) => !activeStatuses || activeStatuses.includes(o.status))
    .filter((o) => {
      if (!search.trim()) return true;

      const q = search.toLowerCase();

      return (
        o.id.toLowerCase().includes(q) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-light text-ink">My Orders</h1>

        <input
          placeholder="Search by item or order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-line px-4 py-2.5 text-sm outline-none focus:border-forest sm:w-72"
        />
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === tab.label
                ? 'border-forest text-forest-dark'
                : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-ink/60">No orders found here.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {filtered.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-line bg-white p-5"
            >

              <div className="flex items-center justify-between text-xs text-ink/50">
                <span>
                  Order #{order.id.slice(0, 8).toUpperCase()} · ...
                </span>
                <div className="flex items-center gap-2">
                  {getGiftRecipientName(order) && (
                    <span className="rounded-full bg-clay/10 px-2.5 py-1 text-[10px] font-medium text-clay">
                      🎁 Gift to {getGiftRecipientName(order)}
                    </span>
                  )}
                  <span className={`rounded-full px-3 py-1 font-medium ${STATUS_STYLES[order.status] ?? 'bg-ink/5 text-ink/60'}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-3 overflow-x-auto">
                {order.items.map((item) => {
                  const imgUrl = item.variant?.product?.images?.[0]?.url;

                  return (
                    <div
                      key={item.id}
                      className="flex w-16 shrink-0 flex-col items-center"
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-lg bg-[#f2f5f1]">
                        {imgUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imgUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <span className="mt-1 line-clamp-1 text-[10px] text-ink/50">
                        ×{item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              {order.status === 'PENDING' && (
                <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  We&apos;ve reserved your order. If you haven&apos;t paid, you can
                  change your payment method to receive your items faster.
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-ink/50">
                <span>
                  {order.items.length} item
                  {order.items.length !== 1 ? 's' : ''} · Order Time:{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  · Order ID: {order.id}
                </span>

                <span className="text-sm font-semibold text-ink">
                  {formatNaira(order.total)}
                </span>
              </div>

              <div className="mt-3 border-t border-line pt-4">
                <OrderActions
                  order={order}
                  onUpdate={(updated) =>
                    setOrders(
                      (prev) =>
                        prev?.map((o) =>
                          o.id === updated.id ? updated : o
                        ) ?? null
                    )
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
