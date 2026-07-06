import { Eye, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../components/Button.jsx';
import DataTable from '../components/DataTable.jsx';
import FormField from '../components/FormField.jsx';
import InlineNotice from '../components/InlineNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Toolbar from '../components/Toolbar.jsx';
import { apiFetch, getApiPage } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import { matchesQuery, sortRows } from '../lib/tableTools.js';
import { useApiResource } from '../lib/useApiResource.js';

export default function UsersPage() {
  const blankForm = { username: '', email: '', role: 'cashier', status: 'active', password: '' };
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [lockedOnly, setLockedOnly] = useState(false);
  const [sortDirection, setSortDirection] = useState('asc');
  const [compactColumns, setCompactColumns] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { data, error, loading, reload } = useApiResource(() => getApiPage('/users?limit=100'), []);
  const rows = data?.data ?? [];

  const filteredRows = useMemo(() => {
    const visibleRows = rows.filter((row) => (
      matchesQuery(row, search, ['username', 'email', 'role', 'status'])
      && (!lockedOnly || row.status === 'locked')
    ));

    return sortRows(visibleRows, 'username', sortDirection);
  }, [lockedOnly, rows, search, sortDirection]);

  const resetForm = () => {
    setForm(blankForm);
    setEditingId('');
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const body = { ...form };
      if (editingId && !body.password) {
        delete body.password;
      }
      await apiFetch(editingId ? `/users/${editingId}` : '/users', {
        method: editingId ? 'PUT' : 'POST',
        body,
      });
      setForm(blankForm);
      setEditingId('');
      setSelectedUser(null);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'username', label: 'Username', render: (row) => <span className="font-black">{row.username}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge tone={row.status === 'locked' ? 'red' : 'green'}>{row.status}</StatusBadge>,
    },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" className="h-8 px-3" onClick={() => setSelectedUser(row)}>
            <Eye size={16} />
            View
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-3"
            onClick={() => {
              setEditingId(row.id);
              setForm({ username: row.username, email: row.email, role: row.role, status: row.status, password: '' });
              setSelectedUser(null);
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
    ? columns.filter((column) => !['email', 'createdAt'].includes(column.key))
    : columns;

  return (
    <>
      <PageHeader title="Users" subtitle="Manage staff accounts, roles, status, and permissions." />
      <Toolbar
        placeholder="Username or role"
        actionLabel="Add User"
        onAction={() => {
          resetForm();
          setSelectedUser(null);
        }}
        searchValue={search}
        onSearchChange={setSearch}
        onFilter={() => setLockedOnly((value) => !value)}
        onSort={() => setSortDirection((value) => (value === 'asc' ? 'desc' : 'asc'))}
        onColumns={() => setCompactColumns((value) => !value)}
        filterLabel={lockedOnly ? 'Locked users' : 'All users'}
        sortLabel={sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
        columnsLabel={compactColumns ? 'Full' : 'Compact'}
        filterActive={lockedOnly}
        columnsActive={compactColumns}
      />
      <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_404px]">
        <div>
          <InlineNotice loading={loading} error={error} empty={!loading && rows.length === 0} />
          {!loading && !error ? <DataTable columns={visibleColumns} rows={filteredRows} /> : null}
        </div>
        <div className="space-y-5">
          {selectedUser ? (
            <section className="panel h-fit p-7">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">User details</p>
              <h2 className="mt-2 text-xl font-black">{selectedUser.username}</h2>
              <p className="mt-3 text-sm text-brand-muted">Email: {selectedUser.email}</p>
              <p className="mt-2 text-sm text-brand-muted">Role: {selectedUser.role}</p>
              <div className="mt-4">
                <StatusBadge tone={selectedUser.status === 'locked' ? 'red' : 'green'}>{selectedUser.status}</StatusBadge>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" onClick={() => setSelectedUser(null)}>Close</Button>
                <Button
                  onClick={() => {
                    setEditingId(selectedUser.id);
                    setForm({
                      username: selectedUser.username,
                      email: selectedUser.email,
                      role: selectedUser.role,
                      status: selectedUser.status,
                      password: '',
                    });
                    setSelectedUser(null);
                  }}
                >
                  Edit
                </Button>
              </div>
            </section>
          ) : null}
          <form className="panel h-fit p-7" onSubmit={saveUser}>
            <h2 className="mb-8 text-2xl font-black">{editingId ? 'Edit User' : 'Add User'}</h2>
            <FormField label="Username">
              <input className="control w-full" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
            </FormField>
            <FormField label="Email">
              <input className="control w-full" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" required />
            </FormField>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <FormField label="Role">
                <select className="control w-full" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              </FormField>
              <FormField label="Status">
                <select className="control w-full" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="active">Active</option>
                  <option value="locked">Locked</option>
                </select>
              </FormField>
              <FormField label="Password">
                <input className="control w-full" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" required={!editingId} />
                <p className="mt-2 text-xs text-slate-500">
                  {editingId
                    ? 'Leave blank to keep the current password. The user can reset their password later.'
                    : 'Set an initial password for the new user. They can use Forgot Password to reset it later.'}
                </p>
              </FormField>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { resetForm(); setSelectedUser(null); }}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save User'}</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
