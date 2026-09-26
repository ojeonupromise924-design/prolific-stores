'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '../../../lib/products';
import { ProductCard } from '../../../components/product-card';
import type { StorefrontProduct } from '../../../lib/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [results, setResults] = useState<StorefrontProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

    useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!query.trim()) {
        if (!cancelled) {
          setResults([]);
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) setIsLoading(true);
      try {
        const res = await getProducts({ search: query, limit: 40 });
        if (!cancelled) {
          setResults(res.data);
          setTotal(res.meta.total);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-2xl font-light text-ink">
        {query ? (
          <>
            Results for <span className="font-medium">&quot;{query}&quot;</span>
          </>
        ) : (
          'Search'
        )}
      </h1>
      {!isLoading && query && (
        <p className="mt-2 text-sm text-ink/50">{total} product{total !== 1 ? 's' : ''} found</p>
      )}

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm text-ink/40">Searching...</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-ink/40">
            {query ? `No products found for "${query}".` : 'Enter a search term to get started.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
