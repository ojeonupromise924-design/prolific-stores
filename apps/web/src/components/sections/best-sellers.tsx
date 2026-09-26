import Link from 'next/link';
import { getProducts } from '../../lib/products';
import { ProductCard } from '../product-card';

export async function BestSellers() {
  const { data: products } = await getProducts({ featured: true, limit: 8 });

  if (products.length === 0) return null;

  return (
    <section className="border-t border-line bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-light text-ink">The Products Everyone&apos;s Loving</h2>
            <p className="mt-3 max-w-xl text-ink/60">
              Your skin deserves products worth coming back for. Explore Prolific favorites
              chosen for effective formulas, beautiful results, and routines that actually feel good.
            </p>
          </div>
          <Link
            href="/shop/best-sellers"
            className="hidden shrink-0 text-sm font-medium text-ink underline underline-offset-4 md:inline-block"
          >
            Shop Best Sellers →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}