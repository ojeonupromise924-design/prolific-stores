'use client';

import { useState } from 'react';
import { X, Copy, Check, Link as LinkIcon } from 'lucide-react';

export function ShareWishlistModal({
  shareUrl,
  onClose,
}: {
  shareUrl: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Share your wishlist</h2>
            <p className="mt-1 text-sm text-ink/50">
              Anyone with this link can view and gift items from your list.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-black/5">
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-[#f2f5f1] p-4">
          <div className="flex items-center gap-3">
            <LinkIcon size={18} className="shrink-0 text-forest-dark" />
            <p className="min-w-0 flex-1 truncate text-xs text-ink/70">{shareUrl}</p>
            <button
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-forest px-3 py-2 text-xs font-medium text-white hover:bg-forest-dark"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-line py-3 text-sm font-medium text-ink hover:bg-black/5"
        >
          Done
        </button>
      </div>
    </div>
  );
}