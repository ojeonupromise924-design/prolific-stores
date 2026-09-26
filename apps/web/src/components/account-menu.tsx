'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { User, Package, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/auth-store';
import { useCartStore } from '../store/cart-store';
import { showToast } from './toast';

export function AccountMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition hover:bg-black/4 hover:text-ink"
        aria-label="Account"
      >
        <User size={19} strokeWidth={1.7} />
      </Link>
    );
  }

  async function handleLogout() {
    setIsOpen(false);
    await logout();
    await fetchCart();
    showToast('Logged out successfully');
  }

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 text-ink/70 transition hover:bg-black/4 hover:text-ink"
        aria-label="Account menu"
      >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-forest/10 text-xs font-semibold text-forest-dark">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.firstName} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-line bg-white p-2 shadow-lg">
          <div className="border-b border-line px-3 py-3">
            <p className="text-sm font-medium text-ink">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 truncate text-xs text-ink/50">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink/80 hover:bg-black/4"
            >
              <Package size={16} className="text-ink/50" />
              My Orders
            </Link>
            <Link
              href="/account/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink/80 hover:bg-black/4"
            >
              <User size={16} className="text-ink/50" />
              Profile
            </Link>
          </div>

          <div className="border-t border-line py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}