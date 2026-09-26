import { getProducts } from '../lib/products';
import { ProductCard } from './product-card';

export async function RelatedProducts({ excludeId }: { excludeId: string }) {
  const { data } = await getProducts({ limit: 5 });
  const related = data.filter((p) => p.id !== excludeId).slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="border-t border-line py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-light text-ink">You May Also Like</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}