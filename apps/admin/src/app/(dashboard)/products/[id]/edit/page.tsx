'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '../../../../../store/auth-store';
import {
  getAdminProduct, getProductVariants, createVariant, deleteVariant,
  getProductImages, uploadProductImage, setProductImagePrimary, deleteProductImage,
  type AdminProductDetail, type ProductVariant, type ProductImage,
} from '../../../../../lib/admin';
import { showToast } from '../../../../../components/toast';

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);

  const [variantForm, setVariantForm] = useState({ name: '', sku: '', price: 0, stock: 0, isDefault: false });
  const [isUploading, setIsUploading] = useState(false);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState('');

  const refreshVariants = useCallback(() => {
    getProductVariants(id, accessToken).then(setVariants).catch(() => {});
  }, [id, accessToken]);

  const refreshImages = useCallback(() => {
    getProductImages(id, accessToken).then(setImages).catch(() => {});
  }, [id, accessToken]);

  useEffect(() => {
    getAdminProduct(id, accessToken).then(setProduct).catch(() => {});
    refreshVariants();
    refreshImages();
  }, [id, accessToken, refreshVariants, refreshImages]);

  async function handleAddVariant(e: React.FormEvent) {
    e.preventDefault();
    await createVariant({ productId: id, ...variantForm }, accessToken);
    setVariantForm({ name: '', sku: '', price: 0, stock: 0, isDefault: false });
    refreshVariants();
    showToast('Variant added');
  }

  async function handleDeleteVariant(variantId: string) {
    if (!confirm('Delete this variant?')) return;
    await deleteVariant(variantId, accessToken);
    refreshVariants();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  }

  async function handleConfirmUpload() {
    if (!pendingFile) return;
    setIsUploading(true);
    try {
      await uploadProductImage(id, pendingFile, altText, accessToken);
      setPendingFile(null);
      setPendingPreview(null);
      setAltText('');
      refreshImages();
      showToast('Image uploaded');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSetPrimary(imageId: string) {
    await setProductImagePrimary(imageId, accessToken);
    refreshImages();
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm('Delete this image?')) return;
    await deleteProductImage(imageId, accessToken);
    refreshImages();
  }

  if (!product) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-light text-slate-900">{product.name}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {product.category.name} · {formatNaira(product.price)} · {product.isPublished ? 'Published' : 'Draft'}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Variants */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Variants</h2>

          <ul className="mt-3 flex flex-col gap-2">
            {variants.map((v) => (
              <li key={v.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <span>{v.name} — {v.sku}</span>
                <span className="flex items-center gap-3">
                  <span className="font-medium">{formatNaira(v.price)}</span>
                  <span className="text-slate-400">Stock: {v.stock}</span>
                  <button onClick={() => handleDeleteVariant(v.id)} className="text-red-600 hover:underline">Delete</button>
                </span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddVariant} className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
            <input
              placeholder="Name (e.g. 50ml)" required value={variantForm.name}
              onChange={(e) => setVariantForm((f) => ({ ...f, name: e.target.value }))}
              className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="SKU" required value={variantForm.sku}
              onChange={(e) => setVariantForm((f) => ({ ...f, sku: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="number" placeholder="Price" required value={variantForm.price || ''}
              onChange={(e) => setVariantForm((f) => ({ ...f, price: Number(e.target.value) }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="number" placeholder="Stock" required value={variantForm.stock || ''}
              onChange={(e) => setVariantForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={variantForm.isDefault} onChange={(e) => setVariantForm((f) => ({ ...f, isDefault: e.target.checked }))} />
              Default variant
            </label>
            <button type="submit" className="col-span-2 rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700">
              Add Variant
            </button>
          </form>
        </div>

        {/* Images */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Images</h2>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative overflow-hidden rounded-lg border border-slate-100">
                <div className="aspect-square w-full bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.altText ?? ''}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                {img.isPrimary && (
                  <span className="absolute left-1 top-1 rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-medium text-white">
                    Primary
                  </span>
                )}
                <div className="flex gap-1 bg-white p-1">
                  {!img.isPrimary && (
                    <button onClick={() => handleSetPrimary(img.id)} className="flex-1 text-[10px] text-violet-600 hover:underline">
                      Set Primary
                    </button>
                  )}
                  <button onClick={() => handleDeleteImage(img.id)} className="flex-1 text-[10px] text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pendingPreview ? (
            <div className="mt-4 rounded-lg border border-slate-200 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingPreview} alt="Preview" className="aspect-square w-24 rounded-lg object-cover" />
              <input
                placeholder="Alt text (describe the image)"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleConfirmUpload}
                  disabled={isUploading}
                  className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Confirm Upload'}
                </button>
                <button
                  onClick={() => { setPendingFile(null); setPendingPreview(null); }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <label className="mt-4 block cursor-pointer rounded-lg border border-dashed border-slate-300 py-4 text-center text-sm text-slate-500 hover:border-violet-400">
              + Upload Image
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}