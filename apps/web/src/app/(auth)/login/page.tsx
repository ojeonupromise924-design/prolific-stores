'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeOff, Eye } from 'lucide-react';
import { AuthLayout } from '../../../components/auth-layout';
import { useAuthStore } from '../../../store/auth-store';
import { useCartStore } from '../../../store/cart-store';
import { ApiError } from '../../../lib/api';
import { showToast } from '@/src/components/toast';
 

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      showToast(`Welcome back, ${result.user.firstName}`);
      await fetchCart();
      router.push(searchParams.get('redirect') || '/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage">Prolific Store</p>
        <h2 className="mt-4 text-4xl font-semibold leading-tight text-white">
          Your skin, understood.
        </h2>
        <p className="mt-3 text-sm text-white/60">
          Personalized routines, verified products, and guidance built around your skin — not just
          your search.
        </p>
      </div>

      <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-white/50">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-mint hover:text-forest-dark">
          Create one
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-sage"
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white placeholder:text-white/30 outline-none focus:border-sage"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-mint hover:text-forest-dark">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-mint py-3 text-sm font-medium text-ink transition hover:bg-forest disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Log In'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/30">Or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

            
       <a  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/auth/google?redirect=${encodeURIComponent(searchParams.get('redirect') || '/')}`}
        className="flex w-full items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-3 text-sm font-medium text-white hover:bg-white/10"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
          <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" />
        </svg>
        Continue with Google
      </a>
    </AuthLayout>
  );
}