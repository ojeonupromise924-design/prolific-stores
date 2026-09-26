'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../store/auth-store';
import { getCategories, createProduct, type Category, type CreateProductPayload } from '../../../../lib/admin';
import { ApiError } from '../../../../lib/api';
import { showToast } from '../../../../components/toast';

const EMPTY: CreateProductPayload = {
  name: '', slug: '', description: '', shortDescription: '', sku: '',
  price: 0, comparePrice: undefined, stock: 0, brand: '',
  isFeatured: false, isPublished: false, categoryId: '',
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NewProductPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CreateProductPayload>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategories(accessToken).then(setCategories).catch(() => {});
  }, [accessToken]);

  function updateField<K extends keyof CreateProductPayload>(key: K, value: CreateProductPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await createProduct(form, accessToken);
            showToast('Product created');
      router.push(`/products/${created.id}/edit`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create product');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-light text-slate-900">New Product</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid max-w-2xl gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Product name" required value={form.name}
            onChange={(e) => { updateField('name', e.target.value); updateField('slug', slugify(e.target.value)); }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
          <input
            placeholder="Slug" required value={form.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </div>

        <textarea
          placeholder="Description" required rows={3} value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
        />
        <input
          placeholder="Short description (optional)" value={form.shortDescription}
          onChange={(e) => updateField('shortDescription', e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="SKU" required value={form.sku}
            onChange={(e) => updateField('sku', e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
          <input
            placeholder="Brand (optional)" value={form.brand}
            onChange={(e) => updateField('brand', e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="number" placeholder="Price" required value={form.price || ''}
            onChange={(e) => updateField('price', Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
          <input
            type="number" placeholder="Compare price (optional)" value={form.comparePrice ?? ''}
            onChange={(e) => updateField('comparePrice', e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
          <input
            type="number" placeholder="Stock" required value={form.stock || ''}
            onChange={(e) => updateField('stock', Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </div>

        <select
          required value={form.categoryId}
          onChange={(e) => updateField('categoryId', e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
        >
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div className="flex gap-6 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => updateField('isFeatured', e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => updateField('isPublished', e.target.checked)} />
            Published
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit" disabled={isSubmitting}
          className="mt-2 rounded-lg bg-violet-600 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Product & Continue'}
        </button>
      </form>
    </div>
  );
}