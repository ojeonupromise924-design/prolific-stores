'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../../../store/auth-store';
import { getOrderById, updateOrderAddress, type Order } from '../../../../../lib/orders';
import { ApiError } from '../../../../../lib/api';

function formatNaira(value: string) {
  return `₦${Number(value).toLocaleString()}`;
}

const LOCKED_STATUSES = ['SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push(`/login?redirect=/account/orders/${params.id}`);
      return;
    }
    getOrderById(params.id, accessToken)
      .then((data) => {
        setOrder(data);
        setForm({
          fullName: data.fullName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 ?? '',
          city: data.city,
          state: data.state,
          postalCode: data.postalCode ?? '',
        });
        if (searchParams.get('edit') === 'address' && !LOCKED_STATUSES.includes(data.status)) {
          setIsEditingAddress(true);
        }
      })
      .catch(() => setError('Order not found.'));
  }, [isInitialized, user, accessToken, params.id, router, searchParams]);

  function updateField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const updated = await updateOrderAddress(params.id, form, accessToken);
      setOrder(updated);
      setIsEditingAddress(false);
      setSaveStatus('idle');
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err instanceof ApiError ? err.message : 'Could not update address');
    }
  }

  if (!isInitialized || (!order && !error)) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink/50">Loading order...</div>;
  }
  if (error || !order) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-red-600">{error}</div>;
  }

  const canEditAddress = !LOCKED_STATUSES.includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/account/orders" className="text-sm text-ink/50 hover:text-ink">
        ← Back to orders
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-light text-ink">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest-dark">
          {order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink/50">
        Placed on{' '}
        {new Date(order.createdAt).toLocaleDateString('en-NG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/40">Items</h2>
          <ul className="mt-4 flex flex-col gap-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between border-b border-line pb-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{item.productName}</p>
                  <p className="text-ink/50">
                    {item.variantName} × {item.quantity}
                  </p>
                </div>
                <span className="font-medium text-ink">
                  {formatNaira((Number(item.unitPrice) * item.quantity).toString())}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-fit rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/40">
              Delivery Address
            </h2>
            {canEditAddress && !isEditingAddress && (
              <button
                onClick={() => setIsEditingAddress(true)}
                className="text-xs font-medium text-forest-dark hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingAddress ? (
            <form onSubmit={handleSaveAddress} className="mt-3 flex flex-col gap-2.5">
              <input
                required
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
              />
              <input
                required
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
              />
              <input
                required
                placeholder="Address"
                value={form.addressLine1}
                onChange={(e) => updateField('addressLine1', e.target.value)}
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
              />
              <input
                placeholder="Apartment, suite, etc. (optional)"
                value={form.addressLine2}
                onChange={(e) => updateField('addressLine2', e.target.value)}
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
                />
                <input
                  required
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
                />
              </div>
              <input
                placeholder="Postal code (optional)"
                value={form.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
              />

              {saveError && <p className="text-xs text-red-600">{saveError}</p>}

              <div className="mt-1 flex gap-2">
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="flex-1 rounded-full bg-forest py-2 text-xs font-medium text-white hover:bg-forest-dark disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:bg-black/4"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-3 text-sm text-ink/70">
              {order.fullName}
              <br />
              {order.phone}
              <br />
              {order.addressLine1}
              {order.addressLine2 && <>, {order.addressLine2}</>}
              <br />
              {order.city}, {order.state}
              {order.postalCode && <> {order.postalCode}</>}
            </p>
          )}

          <div className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              <span>{Number(order.shippingFee) === 0 ? 'Free' : formatNaira(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}