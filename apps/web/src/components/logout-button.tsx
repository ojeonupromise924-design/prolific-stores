'use client';

import { useAuthStore } from '../store/auth-store';
import { useCartStore } from '../store/cart-store';

export function LogoutButton() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fetchCart = useCartStore((s) => s.fetchCart);

  if (!user) return null;

  async function handleLogout() {
    await logout();
    // After logout, no JWT means the backend falls back to
    // guest identity (a fresh guest_token cookie, if issued).
    await fetchCart();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-zinc-600 hover:text-black"
    >
      Sign out ({user.firstName})
    </button>
  );
}