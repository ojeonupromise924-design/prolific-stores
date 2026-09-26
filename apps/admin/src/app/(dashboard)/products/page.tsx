'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/auth-store';
import { getAdminProducts, togglePublish, type AdminProduct, deleteProduct  } from '../../../lib/admin';

import Link from 'next/link';


function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

export default function AdminProductsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getAdminProducts(page, accessToken).then((res) => {
      setProducts(res.data);
      setTotalPages(res.meta.totalPages);
    });
  }, [accessToken, page]);

  async function handleTogglePublish(product: AdminProduct) {
    await togglePublish(product.id, !product.isPublished, accessToken);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isPublished: !p.isPublished } : p)),
    );
  }

  return (
    <div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light text-slate-900">Products</h1>
        <Link href="/products/new" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
          + Add Product
        </Link>
      </div>


      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="flex items-center gap-3 p-4">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f2f5f1]">
                    {p.primaryImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.primaryImage.thumbnailUrl} alt={p.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <span>{p.name}</span>
                </td>
                <td className="p-4 text-ink/60">{p.category?.name ?? '—'}</td>
                <td className="p-4 font-medium">{formatNaira(p.price)}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.isPublished ? 'bg-forest/10 text-forest-dark' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                

                  <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleTogglePublish(p)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium hover:border-violet-400">
                      {p.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link href={`/products/${p.id}/edit`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium hover:border-violet-400">
                      Edit
                    </Link>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete "${p.name}"?`)) return;
                        await deleteProduct(p.id, accessToken);
                        setProducts((prev) => prev.filter((x) => x.id !== p.id));
                      }}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm ${p === page ? 'bg-ink text-white' : 'border border-line'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}