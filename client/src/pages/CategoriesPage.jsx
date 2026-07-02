import { Eye, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import DataTable from '../components/DataTable.jsx';
import FormField from '../components/FormField.jsx';
import InlineNotice from '../components/InlineNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Toolbar from '../components/Toolbar.jsx';
import { apiFetch, getApiPage } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import { matchesQuery, sortRows } from '../lib/tableTools.js';
import { useApiResource } from '../lib/useApiResource.js';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', code: '' });
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [withProductsOnly, setWithProductsOnly] = useState(false);
  const [sortDirection, setSortDirection] = useState('asc');
  const [compactColumns, setCompactColumns] = useState(false);
  const [viewingCategory, setViewingCategory] = useState(null);
  const { data, error, loading, reload } = useApiResource(() => getApiPage('/categories?limit=100'), []);
  const rows = data?.data ?? [];

  const filteredRows = useMemo(() => {
    const visibleRows = rows.filter((row) => (
      matchesQuery(row, search, ['name', 'code', 'createdBy'])
      && (!withProductsOnly || Number(row.productsCount) > 0)
    ));

    return sortRows(visibleRows, 'name', sortDirection);
  }, [rows, search, sortDirection, withProductsOnly]);

  const resetForm = () => {
    setEditingId('');
    setForm({ name: '', code: '' });
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch(editingId ? `/categories/${editingId}` : '/categories', {
        method: editingId ? 'PUT' : 'POST',
        body: form,
      });
      setForm({ name: '', code: '' });
      setEditingId('');
      setViewingCategory(null);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-black">{row.name}</span> },
    { key: 'code', label: 'Code' },
    { key: 'createdBy', label: 'Created by', render: (row) => row.createdBy ?? 'N/A' },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'productsCount', label: 'Products' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" className="h-8 px-3" onClick={() => setViewingCategory(row)}>
            <Eye size={16} />
            View
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-3"
            onClick={() => {
              setEditingId(row.id);
              setForm({ name: row.name, code: row.code });
              setViewingCategory(null);
            }}
          >
            <Pencil size={15} />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  const visibleColumns = compactColumns
    ? columns.filter((column) => !['createdAt', 'createdBy'].includes(column.key))
    : columns;

  return (
    <>
      <PageHeader title="Product Category List" subtitle="View and search product categories." />
      <Toolbar
        placeholder="Search categories..."
        actionLabel="Add Category"
        onAction={resetForm}
        searchValue={search}
        onSearchChange={setSearch}
        onFilter={() => setWithProductsOnly((value) => !value)}
        onSort={() => setSortDirection((value) => (value === 'asc' ? 'desc' : 'asc'))}
        onColumns={() => setCompactColumns((value) => !value)}
        filterLabel={withProductsOnly ? 'With products' : 'All categories'}
        sortLabel={sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
        columnsLabel={compactColumns ? 'Full' : 'Compact'}
        filterActive={withProductsOnly}
        columnsActive={compactColumns}
      />
      <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_404px]">
        <div>
          <InlineNotice loading={loading} error={error} empty={!loading && rows.length === 0} />
          {!loading && !error ? <DataTable columns={visibleColumns} rows={filteredRows} /> : null}
          <Button variant="secondary" className="mt-28" onClick={() => navigate('/products/new')}>
            Add Product
          </Button>
        </div>
        <div className="space-y-5">
          {viewingCategory ? (
            <section className="panel h-fit p-7">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Category details</p>
              <h2 className="mt-2 text-xl font-black">{viewingCategory.name}</h2>
              <p className="mt-3 text-sm text-brand-muted">Code: {viewingCategory.code}</p>
              <p className="mt-2 text-sm text-brand-muted">Products: {viewingCategory.productsCount ?? 0}</p>
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" onClick={() => setViewingCategory(null)}>Close</Button>
                <Button
                  onClick={() => {
                    setEditingId(viewingCategory.id);
                    setForm({ name: viewingCategory.name, code: viewingCategory.code });
                    setViewingCategory(null);
                  }}
                >
                  Edit
                </Button>
              </div>
            </section>
          ) : null}
          <form className="panel h-fit p-7" onSubmit={saveCategory}>
            <h2 className="mb-8 text-2xl font-black">{editingId ? 'Edit Category' : 'Add Category'}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Category name">
                <input className="control w-full" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </FormField>
              <FormField label="Code">
                <input className="control w-full" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required />
              </FormField>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <Button variant="secondary" onClick={() => { resetForm(); setViewingCategory(null); }}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
