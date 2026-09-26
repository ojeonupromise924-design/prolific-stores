'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayment } from '../../../../lib/orders';
import { useAuthStore } from '../../../../store/auth-store';
import { useCartStore } from '../../../../store/cart-store';

export default function CheckoutCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

    useEffect(() => {
    if (!isInitialized) return;

    const reference = searchParams.get('reference') || searchParams.get('trxref');

    Promise.resolve()
      .then(() => {
        if (!reference) {
          throw new Error('No payment reference found.');
        }
        return verifyPayment(reference, accessToken);
      })
      .then(async () => {
        setStatus('success');
        await fetchCart();
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Payment verification failed.');
      });
  }, [isInitialized, accessToken, searchParams, fetchCart]);

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      {status === 'verifying' && (
        <p className="text-ink/60">Confirming your payment...</p>
      )}
      {status === 'success' && (
        <>
          <h1 className="text-2xl font-light text-ink">Order confirmed 🎉</h1>
          <p className="mt-2 text-sm text-ink/60">
            Thank you — your order has been placed successfully.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-forest-dark"
          >
            Continue Shopping
          </button>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="text-2xl font-light text-ink">Payment issue</h1>
          <p className="mt-2 text-sm text-red-600">{message}</p>
        </>
      )}
    </div>
  );
}