'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '../../../components/auth-layout';
import { api, ApiError } from '../../../lib/api';
import { showToast } from '../../../components/toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      showToast('Password reset successfully');
      router.push('/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-white">Choose a new password</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-mint"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-mint"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-mint py-3 text-sm font-medium text-ink transition hover:bg-forest disabled:opacity-50"
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </AuthLayout>
  );
}