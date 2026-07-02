import { Eye, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import DataTable from '../components/DataTable.jsx';
import InlineNotice from '../components/InlineNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Toolbar from '../components/Toolbar.jsx';
import { getApiPage } from '../lib/api.js';
import { formatCurrency, saleItemsLabel } from '../lib/format.js';
import { useApiResource } from '../lib/useApiResource.js';

export default function SalesPage() {
  const navigate = useNavigate();
  const { data, error, loading } = useApiResource(() => getApiPage('/sales?limit=100'), []);
  const rows = data?.data ?? [];
  const columns = [
    { key: 'id', label: 'Sale ID' },
    { key: 'saleDate', label: 'Date' },
    { key: 'createdBy', label: 'Created by', render: (row) => row.createdBy ?? 'N/A' },
    { key: 'totalAmount', label: 'Total', render: (row) => formatCurrency(row.totalAmount) },
    { key: 'amountPaid', label: 'Paid', render: (row) => formatCurrency(row.amountPaid) },
    {
      key: 'balance',
      label: 'Balance',
      render: (row) => <span className={Number(row.balance) < 0 ? 'font-black text-brand-red' : ''}>{formatCurrency(row.balance)}</span>,
    },
    { key: 'customer', label: 'Customer', render: (row) => row.customer?.name ?? 'N/A' },
    { key: 'products', label: 'Products(Qty x Price)', cellClassName: 'min-w-56', render: (row) => saleItemsLabel(row.items) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" className="h-8 px-3" onClick={() => navigate(`/sales/${row.id}`)}>
            <Eye size={16} />
            View
          </Button>
          <Button variant="ghost" className="h-8 px-3" onClick={() => navigate(`/sales/${row.id}/edit`)}>
            <Pencil size={15} />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Sale Management List" subtitle="View and search sales, balances, line items, and customer links." />
      <Toolbar
        placeholder="Search sales..."
        actionLabel="Add Sale"
        onAction={() => navigate('/sales/new')}
        extra={<Button variant="secondary">25 / page</Button>}
      />
      <InlineNotice loading={loading} error={error} empty={!loading && rows.length === 0} />
      {!loading && !error ? <DataTable className="mt-7" columns={columns} rows={rows} /> : null}
      <div className="mt-5 flex items-center justify-between text-sm text-brand-muted">
        <span>Showing {rows.length} of {data?.meta?.total ?? rows.length}</span>
        <div className="flex gap-3">
          <Button variant="secondary">Prev</Button>
          <Button variant="ghost">Next</Button>
        </div>
      </div>
    </>
  );
}
