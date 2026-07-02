import { Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import InlineNotice from '../components/InlineNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { apiFetch, apiUpload, getApiData, getApiPage } from '../lib/api.js';
import { useApiResource } from '../lib/useApiResource.js';

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEdit = Boolean(productId);
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    price: '',
    qtyInStock: '',
    reorderLevel: '5',
    imageUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const categories = useApiResource(() => getApiPage('/categories?limit=100'), []);
  const product = useApiResource(() => (isEdit ? getApiData(`/products/${productId}`) : Promise.resolve(null)), [isEdit, productId]);

  useEffect(() => {
    if (product.data) {
      setForm({
        name: product.data.name ?? '',
        categoryId: product.data.categoryId ?? '',
        price: String(product.data.price ?? ''),
        qtyInStock: String(product.data.qtyInStock ?? ''),
        reorderLevel: String(product.data.reorderLevel ?? 5),
        imageUrl: product.data.imageUrl ?? '',
      });
    }
  }, [product.data]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PNG, JPG, and WebP images are allowed');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const payload = await apiUpload('/uploads', formData);
      setForm({ ...form, imageUrl: payload.data.imageUrl });
    } catch (error) {
      setUploadError(error.message ?? 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiFetch(isEdit ? `/products/${productId}` : '/products', {
        method: isEdit ? 'PUT' : 'POST',
        body: {
          ...form,
          price: Number(form.price),
          qtyInStock: Number(form.qtyInStock),
          reorderLevel: Number(form.reorderLevel),
        },
      });
      setMessage('Product saved');
      navigate('/products');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title={isEdit ? 'Edit Product' : 'Add Product'} subtitle="Create inventory records and capture stock changes for audit." />
      <InlineNotice loading={categories.loading || product.loading} error={categories.error || product.error} />
      <section className="grid gap-7 xl:grid-cols-[minmax(0,704px)_374px]">
        <form className="panel p-7" onSubmit={saveProduct}>
          <h2 className="mb-8 text-2xl font-black">Product Details</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField label="Product name">
              <input className="control w-full" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </FormField>
            <FormField label="Category">
              <select className="control w-full" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required>
                <option value="">Select category</option>
                {(categories.data?.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <FormField label="Price">
              <input className="control w-full" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} type="number" min="0" step="0.01" required />
            </FormField>
            <FormField label="Quantity">
              <input className="control w-full" value={form.qtyInStock} onChange={(event) => setForm({ ...form, qtyInStock: event.target.value })} type="number" min="0" required />
            </FormField>
            <FormField label="Reorder level">
              <input className="control w-full" value={form.reorderLevel} onChange={(event) => setForm({ ...form, reorderLevel: event.target.value })} type="number" min="0" />
            </FormField>
          </div>

          <FormField label="Product image">
            {uploadError && <p className="mb-4 text-sm text-red-600">{uploadError}</p>}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              disabled={uploading}
              className="mb-4 w-full"
            />
            {form.imageUrl ? (
              <div className="grid h-48 place-items-center rounded-lg border border-brand-line bg-slate-50">
                <img src={form.imageUrl} alt="Product" className="max-h-48 max-w-xs object-contain" />
              </div>
            ) : (
              <div className="grid h-48 place-items-center rounded-lg border border-brand-line bg-slate-50">
                <div className="text-center">
                  <div className="mx-auto grid h-20 w-36 place-items-center rounded-lg bg-orange-100 text-brand-orange">
                    <Upload size={28} />
                  </div>
                  <p className="mt-3 font-black text-brand-orange">{uploading ? 'Uploading...' : 'Image upload'}</p>
                  <p className="mt-1 text-xs text-brand-muted">PNG or JPG up to 5 MB</p>
                </div>
              </div>
            )}
          </FormField>

          {message ? <p className="mt-8 rounded-lg bg-green-50 px-5 py-3 text-sm font-black text-brand-green">{message}</p> : null}

          <div className="mt-10 flex justify-end gap-4">
            <Button variant="secondary" onClick={() => navigate('/products')}>Cancel</Button>
            <Button type="submit" disabled={saving || uploading}>{saving ? 'Saving...' : 'Save Product'}</Button>
          </div>
        </form>

        <aside className="panel h-fit p-7">
          <h2 className="text-xl font-black">Stock Audit Preview</h2>
          <p className="mt-5 text-sm leading-6 text-brand-muted">Changing quantity from 2 to 6 creates a stock movement entry.</p>
          <div className="mt-8">
            <StatusBadge>{isEdit ? 'Adjustment logged' : 'Initial stock logged'}</StatusBadge>
          </div>
          <div className="mt-8 border-t border-brand-line pt-7">
            <h3 className="font-black">Inventory log</h3>
            <p className="mt-4 text-sm text-brand-muted">Type: Manual adjustment</p>
            <p className="mt-3 text-sm text-brand-muted">By: Administrator</p>
          </div>
        </aside>
      </section>
    </>
  );
}
