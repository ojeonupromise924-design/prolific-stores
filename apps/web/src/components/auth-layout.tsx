'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Slide {
  eyebrow: string;
  headline: string;
  body: string;
  image: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    eyebrow: 'Prolific Store',
    headline: 'Your skin, understood.',
    body: 'Personalized routines, verified products, and guidance built around your skin — not just your search.',
    image: '/auth/slide-1.jpg',
  },
  {
    eyebrow: 'Shop by Concern',
    headline: 'Find what actually works for you.',
    body: 'From acne to dark spots to dryness — shop by what your skin needs, not just by brand.',
    image: '/auth/slide-2.jpg',
  },
  {
    eyebrow: 'Prolific Beauty',
    headline: 'Meet your AI Beauty Assistant.',
    body: 'Tell us your skin type and goals — get product recommendations built just for you.',
    image: '/auth/slide-3.jpg',
  },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % DEFAULT_SLIDES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const slide = DEFAULT_SLIDES[activeSlide];

  return (
    <div className="grid min-h-screen bg-ink lg:grid-cols-2">
      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 inline-block">
            <span className="text-xl font-semibold tracking-tight text-white">Prolific</span>
            <span className="ml-1 text-xl font-light tracking-tight text-mint">Store</span>
          </Link>
          {children}
        </div>
      </div>

      {/* Visual panel */}
      <div className="relative hidden overflow-hidden bg-[#0d0d0f] lg:flex lg:flex-col lg:justify-end">
        {/* Crossfading background images */}
        {DEFAULT_SLIDES.map((s, i) => (
          <div
            key={s.image}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${s.image})`,
              opacity: i === activeSlide ? 1 : 0,
            }}
          />
        ))}

        {/* Dark gradient overlay so text stays legible */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/20" />

        <div key={activeSlide} className="relative z-10 mx-auto mb-24 w-full max-w-md animate-fade-in px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
            {slide.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-light leading-tight text-white">{slide.headline}</h2>
          <p className="mt-4 text-sm leading-6 text-white/70">{slide.body}</p>

          <div className="mt-8 flex gap-1.5">
            {DEFAULT_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                aria-label={`Show slide ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === activeSlide ? 'w-6 bg-mint' : 'w-6 bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}