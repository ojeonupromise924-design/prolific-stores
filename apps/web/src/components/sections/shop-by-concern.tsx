import Link from 'next/link';

const CONCERNS = [
  'Acne & Breakouts', 'Dark Spots', 'Dryness', 'Dullness',
  'Sensitive Skin', 'Uneven Texture', 'Oil Control', 'Signs of Aging',
];

export function ShopByConcern() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-light text-ink">Your Skin Has Needs. We Have Solutions.</h2>
        <p className="mt-3 max-w-xl text-ink/60">
          Whether you&apos;re dealing with dryness, breakouts, dark spots, dullness, sensitivity, or uneven texture, find products designed around what your skin needs most.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {CONCERNS.map((concern) => (
            <div
              key={concern}
              className="flex h-28 items-center justify-center rounded-2xl bg-forest/10 px-4 text-center text-sm font-medium text-ink transition hover:bg-forest/20"
            >
              {concern}
            </div>
          ))}
        </div>
        <Link href="/concerns" className="mt-8 inline-block text-sm font-medium text-ink underline underline-offset-4">
          Shop by Concern →
        </Link>
      </div>
    </section>
  );
}