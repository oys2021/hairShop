import { Eye, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import DataTable from '../components/DataTable.jsx';
import InlineNotice from '../components/InlineNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProductThumb from '../components/ProductThumb.jsx';
import Toolbar from '../components/Toolbar.jsx';
import { getApiPage } from '../lib/api.js';
import { formatCurrency, formatDate } from '../lib/format.js';
import { useApiResource } from '../lib/useApiResource.js';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { data, error, loading } = useApiResource(() => getApiPage('/products?limit=100'), []);
  const rows = data?.data ?? [];
  const columns = [
    {
      key: 'name',
      label: 'Image / Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <ProductThumb />
          <span className="max-w-[210px] truncate font-black">{row.name}</span>
        </div>
      ),
    },
    { key: 'id', label: 'Product ID' },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
    {
      key: 'qtyInStock',
      label: 'Qty',
      render: (row) => <span className={row.qtyInStock <= row.reorderLevel ? 'font-black text-brand-red' : ''}>{row.qtyInStock}</span>,
    },
    { key: 'createdBy', label: 'Created by', render: (row) => row.createdBy ?? 'N/A' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" className="h-8 px-3">
            <Eye size={16} />
            View
          </Button>
          <Button variant="ghost" className="h-8 px-3" onClick={() => navigate(`/products/${row.id}/edit`)}>
            <Pencil size={15} />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Products" subtitle="View, search, sort, and manage beauty retail inventory." />
      <Toolbar placeholder="Search products..." actionLabel="Add Product" onAction={() => navigate('/products/new')} />
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
