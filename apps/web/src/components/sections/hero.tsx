import Link from 'next/link';

export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start px-6 py-24 md:py-32">
      <h1 className="max-w-3xl text-5xl font-light leading-tight text-ink md:text-6xl">
        Dreams Made Reality for Your Skin
      </h1>
      <p className="mt-6 max-w-xl text-lg text-ink/60">
        Skincare that meets you where you are and takes your routine where you want to go.
      </p>
      <p className="mt-2 max-w-xl text-lg text-ink/60">
        From everyday essentials to targeted treatments, discover products carefully selected to help you build a routine your skin will love.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/shop" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-base hover:bg-ink/90">
          Shop Skincare →
        </Link>
        <Link href="/concerns" className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink hover:bg-white">
          Find Your Routine →
        </Link>
      </div>
    </section>
  );
}