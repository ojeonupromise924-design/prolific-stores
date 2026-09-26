'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/auth-store';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  type Category, type CategoryPayload,
} from '../../../lib/admin';
import { ApiError } from '../../../lib/api';
import { showToast } from '../../../components/toast';

const EMPTY_FORM: CategoryPayload = { name: '', slug: '', description: '', isActive: true };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminCategoriesPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryPayload>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategories(accessToken).then(setCategories).catch(() => {});
  }, [accessToken]);

  function updateField<K extends keyof CategoryPayload>(key: K, value: CategoryPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      isActive: category.isActive,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    showToast(editingId ? 'Category updated' : 'Category created');
    try {
      if (editingId) {
        const updated = await updateCategory(editingId, form, accessToken);
        setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
      } else {
        const created = await createCategory(form, accessToken);
        setCategories((prev) => [...prev, created]);
      }
      cancelEdit();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? This only works if it has no products.')) return;
    try {
      await deleteCategory(id, accessToken);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not delete category');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-light text-ink">Categories</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid max-w-lg gap-3 rounded-2xl border border-line bg-white p-5">
        <p className="text-sm font-semibold text-ink">{editingId ? 'Edit Category' : 'New Category'}</p>
        <input
          placeholder="Name"
          required
          value={form.name}
          onChange={(e) => {
            updateField('name', e.target.value);
            if (!editingId) updateField('slug', slugify(e.target.value));
          }}
          className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
        />
        <input
          placeholder="Slug"
          required
          value={form.slug}
          onChange={(e) => updateField('slug', e.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={2}
          className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
        />
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateField('isActive', e.target.checked)}
          />
          Active
        </label>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-forest-dark disabled:opacity-50"
          >
            {editingId ? 'Save Changes' : 'Add Category'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-black/4"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-ink">{c.name}</p>
                <p className="mt-1 text-xs text-ink/40">{c.slug}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${c.isActive ? 'bg-forest/10 text-forest-dark' : 'bg-ink/5 text-ink/40'}`}>
                {c.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => startEdit(c)} className="text-xs font-medium text-forest-dark hover:underline">
                Edit
              </button>
              <button onClick={() => handleDelete(c.id)} className="text-xs font-medium text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}