'use client';

import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');

  return (
    <section className="bg-ink py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl font-light text-canvas">Your Skin Deserves to Be in the Know.</h2>
        <p className="mt-3 text-base/60">
          Sign up for skincare tips, product drops, new arrivals, exclusive offers, and beauty discoveries delivered straight to your inbox.
        </p>
        <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full border border-white/20 bg-transparent px-5 py-3 text-sm text-canvas outline-none placeholder:text-canvas/40 focus:border-sage"
          />
          <button type="submit" className="rounded-full bg-sage px-6 py-3 text-sm font-medium text-ink hover:bg-sage-dark">
            Join Prolific →
          </button>
        </form>
        <p className="mt-4 text-xs text-canvas/40">No unnecessary noise. Just things your skin will love.</p>
      </div>
    </section>
  );
}