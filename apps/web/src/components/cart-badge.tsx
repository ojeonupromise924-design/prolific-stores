'use client';

import type { ReactNode } from 'react';
import { useCartStore } from '../store/cart-store';

export function CartBadge({ icon }: { icon?: ReactNode }) {
  const itemCount = useCartStore((s) => s.cart.itemCount);
  const openDrawer = useCartStore((s) => s.openDrawer);

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="relative inline-flex items-center justify-center"
      aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
    >
      {icon ?? <span className="text-sm font-medium">Cart</span>}

      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4.25 min-w-4.25 items-center justify-center rounded-full bg-sage-dark px-1 text-[9px] font-semibold leading-none text-white"
>
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
