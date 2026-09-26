'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '../../../components/auth-layout';
import { api } from '../../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/auth/forgot-password', { email });
    } finally {
      // Always show the same success state — same reasoning as the
      // backend: don't reveal whether an email is registered.
      setStatus('sent');
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-white">Reset your password</h1>
      <p className="mt-2 text-sm text-white/50">
        <Link href="/login" className="font-medium text-mint hover:text-white">
          ← Back to login
        </Link>
      </p>

      {status === 'sent' ? (
        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          If an account exists for <span className="text-white">{email}</span>, we&apos;ve sent a
          password reset link. Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-mint"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="mt-2 rounded-full bg-mint py-3 text-sm font-medium text-ink transition hover:bg-forest disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}