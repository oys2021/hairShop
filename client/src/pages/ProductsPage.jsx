import { Eye, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import DataTable from '../components/DataTable.jsx';
import InlineNotice from '../components/InlineNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProductThumb from '../components/ProductThumb.jsx';
import Toolbar from '../components/Toolbar.jsx';
import { getApiPage } from '../lib/api.js';
import { formatCurrency, formatDate } from '../lib/format.js';
import { getPage, matchesQuery, sortRows } from '../lib/tableTools.js';
import { useApiResource } from '../lib/useApiResource.js';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortDirection, setSortDirection] = useState('asc');
  const [compactColumns, setCompactColumns] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { data, error, loading } = useApiResource(() => getApiPage('/products?limit=100'), []);
  const rows = data?.data ?? [];

  const filteredRows = useMemo(() => {
    const visibleRows = rows.filter((row) => (
      matchesQuery(row, search, ['name', 'id', 'createdBy', (product) => product.category?.name])
      && (!lowStockOnly || Number(row.qtyInStock) <= Number(row.reorderLevel ?? 0))
    ));

    return sortRows(visibleRows, 'name', sortDirection);
  }, [lowStockOnly, rows, search, sortDirection]);

  const pageSize = 10;
  const pageData = getPage(filteredRows, page, pageSize);

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
          <Button variant="secondary" className="h-8 px-3" onClick={() => setSelectedProduct(row)}>
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

  const visibleColumns = compactColumns
    ? columns.filter((column) => !['createdAt', 'createdBy'].includes(column.key))
    : columns;

  return (
    <>
      <PageHeader title="Products" subtitle="View, search, sort, and manage beauty retail inventory." />
      <Toolbar
        placeholder="Search products..."
        actionLabel="Add Product"
        onAction={() => navigate('/products/new')}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onFilter={() => {
          setLowStockOnly((value) => !value);
          setPage(1);
        }}
        onSort={() => setSortDirection((value) => (value === 'asc' ? 'desc' : 'asc'))}
        onColumns={() => setCompactColumns((value) => !value)}
        filterLabel={lowStockOnly ? 'Showing low stock' : 'Show low stock'}
        sortLabel={sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
        columnsLabel={compactColumns ? 'Full' : 'Compact'}
        filterActive={lowStockOnly}
        columnsActive={compactColumns}
      />
      <InlineNotice loading={loading} error={error} empty={!loading && rows.length === 0} />
      {!loading && !error ? <DataTable className="mt-7" columns={visibleColumns} rows={pageData.rows} /> : null}
      {selectedProduct ? (
        <section className="panel mt-5 flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Selected product</p>
            <h2 className="mt-1 text-xl font-black">{selectedProduct.name}</h2>
            <p className="mt-2 text-sm text-brand-muted">
              {selectedProduct.id} - {formatCurrency(selectedProduct.price)} - {selectedProduct.qtyInStock} in stock
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setSelectedProduct(null)}>Close</Button>
            <Button onClick={() => navigate(`/products/${selectedProduct.id}/edit`)}>Edit Product</Button>
          </div>
        </section>
      ) : null}
      <div className="mt-5 flex items-center justify-between text-sm text-brand-muted">
        <span>Showing {pageData.start}-{pageData.end} of {filteredRows.length}</span>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            disabled={pageData.currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Prev
          </Button>
          <Button
            variant="ghost"
            disabled={pageData.currentPage >= pageData.pageCount}
            onClick={() => setPage((value) => Math.min(pageData.pageCount, value + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
