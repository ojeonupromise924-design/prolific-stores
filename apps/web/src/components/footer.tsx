'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FOOTER_COLUMNS, LEGAL_LINKS, SOCIAL_LINKS } from '../lib/footer-data';

function SocialIcon({ label }: { label: string }) {
  const common = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'currentColor' };

  switch (label) {
    case 'Instagram':
      return (
        <svg {...common}>
          <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2 .25 2.4.42.6.24 1 .53 1.5.98.4.4.7.9.9 1.5.2.4.4 1.2.4 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 2-.4 2.4-.2.6-.5 1-.9 1.5-.5.4-1 .7-1.5.9-.4.2-1.2.4-2.4.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.2-2.4-.4-.6-.2-1-.5-1.5-.9-.4-.5-.7-1-.9-1.5-.2-.4-.4-1.2-.4-2.4-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-2 .4-2.4.2-.6.5-1 .9-1.5.5-.4 1-.7 1.5-.9.4-.2 1.2-.4 2.4-.4C8.4 2.2 8.8 2.2 12 2.2M12 0C8.7 0 8.3 0 7 .1c-1.3.1-2.2.3-3 .6-.8.3-1.5.7-2.2 1.4C1.1 2.8.7 3.5.4 4.3.1 5.1-.1 6-.1 7.3 0 8.6 0 9 0 12.3s0 3.7.1 5c.1 1.3.3 2.2.6 3 .3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.7.5 3 .6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.2-.3 3-.6.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.7.6-3 .1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.2-.6-3-.3-.8-.7-1.5-1.4-2.2C21.2 1.1 20.5.7 19.7.4 18.9.1 18 0 16.7-.1 15.3 0 14.9 0 12 0z" />
          <path d="M12 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zm0 10.2a4 4 0 110-8 4 4 0 010 8zM18.4 4.6a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
        </svg>
      );
    case 'TikTok':
      return (
        <svg {...common}>
          <path d="M16.6 5.8c-.9-.9-1.5-2.1-1.6-3.5h-3v13.6c0 1.5-1.2 2.7-2.7 2.7s-2.7-1.2-2.7-2.7 1.2-2.7 2.7-2.7c.3 0 .5 0 .8.1V10c-.3 0-.5-.1-.8-.1-3.2 0-5.8 2.6-5.8 5.8s2.6 5.8 5.8 5.8 5.8-2.6 5.8-5.8V9.1c1.2.9 2.7 1.4 4.3 1.4V7.5c-.9 0-1.7-.3-2.4-.8-.2-.2-.4-.3-.5-.5z" />
        </svg>
      );
    case 'YouTube':
      return (
        <svg {...common}>
          <path d="M23.5 7.2s-.2-1.6-.9-2.4c-.9-1-1.9-1-2.3-1C17.3 3.6 12 3.6 12 3.6s-5.3 0-8.3.2c-.4 0-1.4 0-2.3 1-.7.8-.9 2.4-.9 2.4S.3 9 .3 10.9v1.9c0 1.9.2 3.7.2 3.7s.2 1.6.9 2.4c.9 1 2 1 2.5 1.1 1.8.2 7.8.2 7.8.2s5.3 0 8.3-.3c.4 0 1.4 0 2.3-1 .7-.8.9-2.4.9-2.4s.2-1.9.2-3.7v-1.9c0-1.9-.2-3.7-.2-3.7zM9.6 15.1V8.4l6.4 3.4-6.4 3.3z" />
        </svg>
      );
    case 'Facebook':
      return (
        <svg {...common}>
          <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0022 12z" />
        </svg>
      );
    case 'X':
      return (
        <svg {...common}>
          <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.6L18.9 2zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="border-t border-line bg-white">
      {/* Newsletter strip */}
      <div className="border-b border-line bg-[#f2f5f1]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-light text-ink">Stay Beautifully Informed</h2>
            <p className="mt-2 max-w-md text-sm text-ink/60">
              Get skincare tips, exclusive offers, new brand launches and personalised beauty updates.
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full border border-line bg-white px-5 py-3 text-sm outline-none focus:border-sage"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-sage-dark"
            >
              Subscribe
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Main columns */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12">
          <span className="text-lg font-semibold tracking-tight text-ink">Prolific</span>
          <span className="ml-1 text-lg font-light tracking-tight text-forest-dark">Store</span>
          <p className="mt-2 max-w-sm text-sm text-ink/50">
            Your intelligent beauty commerce ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink/65 transition hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-xs text-ink/50 hover:text-ink">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/50 transition hover:bg-black/4 hover:text-ink"
              >
                <SocialIcon label={social.label} />
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-line px-6 py-6 text-center">
          <p className="text-xs text-ink/40">
            © {new Date().getFullYear()} Prolific Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}