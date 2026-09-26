'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth-store';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8">
        <h1 className="mb-1 text-xl font-semibold text-ink">Prolific Admin</h1>
        <p className="mb-6 text-sm text-ink/50">Sign in to continue</p>
        <div className="flex flex-col gap-3">
          <input
            type="email" placeholder="Email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
          />
          <input
            type="password" placeholder="Password" required value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit" disabled={isSubmitting}
            className="mt-2 rounded-full bg-ink py-3 text-sm font-medium text-white hover:bg-forest-dark disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}