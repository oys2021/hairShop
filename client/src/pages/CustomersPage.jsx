import { Eye, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
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

export default function CustomersPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [hasEmailOnly, setHasEmailOnly] = useState(false);
  const [sortDirection, setSortDirection] = useState('asc');
  const [compactColumns, setCompactColumns] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { data, error, loading, reload } = useApiResource(() => getApiPage('/customers?limit=100'), []);
  const rows = data?.data ?? [];

  const filteredRows = useMemo(() => {
    const visibleRows = rows.filter((row) => (
      matchesQuery(row, search, ['name', 'phone', 'email'])
      && (!hasEmailOnly || Boolean(row.email))
    ));

    return sortRows(visibleRows, 'name', sortDirection);
  }, [hasEmailOnly, rows, search, sortDirection]);

  const resetForm = () => {
    setEditingId('');
    setForm({ name: '', phone: '', email: '' });
  };

  const saveCustomer = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch(editingId ? `/customers/${editingId}` : '/customers', {
        method: editingId ? 'PUT' : 'POST',
        body: form,
      });
      setForm({ name: '', phone: '', email: '' });
      setEditingId('');
      setSelectedCustomer(null);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-black">{row.name}</span> },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" className="h-8 px-3" onClick={() => setSelectedCustomer(row)}>
            <Eye size={16} />
            View
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-3"
            onClick={() => {
              setEditingId(row.id);
              setForm({ name: row.name, phone: row.phone ?? '', email: row.email ?? '' });
              setSelectedCustomer(null);
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
    ? columns.filter((column) => column.key !== 'createdAt')
    : columns;

  return (
    <>
      <PageHeader title="Customers" subtitle="Manage client contact details and assign them during checkout." />
      <Toolbar
        placeholder="Customer name, phone, email"
        actionLabel="Add Customer"
        onAction={() => {
          resetForm();
          setSelectedCustomer(null);
        }}
        searchValue={search}
        onSearchChange={setSearch}
        onFilter={() => setHasEmailOnly((value) => !value)}
        onSort={() => setSortDirection((value) => (value === 'asc' ? 'desc' : 'asc'))}
        onColumns={() => setCompactColumns((value) => !value)}
        filterLabel={hasEmailOnly ? 'With email' : 'All customers'}
        sortLabel={sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
        columnsLabel={compactColumns ? 'Full' : 'Compact'}
        filterActive={hasEmailOnly}
        columnsActive={compactColumns}
      />
      <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_404px]">
        <div>
          <InlineNotice loading={loading} error={error} empty={!loading && rows.length === 0} />
          {!loading && !error ? <DataTable columns={visibleColumns} rows={filteredRows} /> : null}
        </div>
        <div className="space-y-5">
          {selectedCustomer ? (
            <section className="panel h-fit p-7">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Customer details</p>
              <h2 className="mt-2 text-xl font-black">{selectedCustomer.name}</h2>
              <p className="mt-3 text-sm text-brand-muted">Phone: {selectedCustomer.phone || 'N/A'}</p>
              <p className="mt-2 text-sm text-brand-muted">Email: {selectedCustomer.email || 'N/A'}</p>
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" onClick={() => setSelectedCustomer(null)}>Close</Button>
                <Button
                  onClick={() => {
                    setEditingId(selectedCustomer.id);
                    setForm({
                      name: selectedCustomer.name,
                      phone: selectedCustomer.phone ?? '',
                      email: selectedCustomer.email ?? '',
                    });
                    setSelectedCustomer(null);
                  }}
                >
                  Edit
                </Button>
              </div>
            </section>
          ) : null}
          <form className="panel h-fit p-7" onSubmit={saveCustomer}>
            <h2 className="mb-8 text-2xl font-black">{editingId ? 'Edit Customer' : 'Add Customer'}</h2>
            <FormField label="Name">
              <input className="control w-full" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </FormField>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <FormField label="Phone">
                <input className="control w-full" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </FormField>
              <FormField label="Email">
                <input className="control w-full" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" />
              </FormField>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { resetForm(); setSelectedCustomer(null); }}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Customer'}</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
