'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../../store/cart-store';
import { useAuthStore } from '../../../store/auth-store';
import { createOrder } from '../../../lib/orders';
import { ApiError } from '../../../lib/api';

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingFee = cart.subtotal >= 25000 ? 0 : 3000;
  const total = cart.subtotal + shippingFee;

  function updateField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const result = await createOrder(form, accessToken);
      // Full page navigation to Paystack's hosted checkout —
      // this is intentional, not an SPA route.
      window.location.href = result.authorizationUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start checkout');
      setIsSubmitting(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-light text-ink">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink/60">Add something before checking out.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-light text-ink">Checkout</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/40">
            Delivery Details
          </h2>

          <input
            required
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            className="rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
          />
          <input
            required
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
          />
          <input
            required
            placeholder="Address"
            value={form.addressLine1}
            onChange={(e) => updateField('addressLine1', e.target.value)}
            className="rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
          />
          <input
            placeholder="Apartment, suite, etc. (optional)"
            value={form.addressLine2}
            onChange={(e) => updateField('addressLine2', e.target.value)}
            className="rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="City"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
            />
            <input
              required
              placeholder="State"
              value={form.state}
              onChange={(e) => updateField('state', e.target.value)}
              className="rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
            />
          </div>
          <input
            placeholder="Postal code (optional)"
            value={form.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className="rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 rounded-full bg-ink py-3 text-sm font-medium text-white hover:bg-forest-dark disabled:opacity-50"
          >
            {isSubmitting ? 'Redirecting to payment...' : 'Continue to Payment'}
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-line p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/40">
            Order Summary
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-ink/70">
                  {item.variant.product.name} × {item.quantity}
                </span>
                <span className="font-medium text-ink">
                  {formatNaira(Number(item.unitPrice) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatNaira(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : formatNaira(shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatNaira(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}