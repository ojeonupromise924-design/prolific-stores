'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const OCCASIONS = ['GENERAL', 'BIRTHDAY', 'WEDDING', 'ANNIVERSARY', 'OTHER'];

export function CreateWishlistModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, occasion: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreate(name, occasion);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold text-ink">Create a New Wishlist</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-black/5">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            placeholder="Wishlist name (e.g. My Birthday List)"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
          />
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-forest"
          >
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>
                {o.charAt(0) + o.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-forest py-3 text-sm font-medium text-white hover:bg-forest-dark disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Wishlist'}
          </button>
        </form>
      </div>
    </div>
  );
}