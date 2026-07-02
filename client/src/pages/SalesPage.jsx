import { Eye, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import DataTable from '../components/DataTable.jsx';
import InlineNotice from '../components/InlineNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Toolbar from '../components/Toolbar.jsx';
import { getApiPage } from '../lib/api.js';
import { formatCurrency, saleItemsLabel } from '../lib/format.js';
import { getPage, matchesQuery, sortRows } from '../lib/tableTools.js';
import { useApiResource } from '../lib/useApiResource.js';

export default function SalesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [openBalanceOnly, setOpenBalanceOnly] = useState(false);
  const [sortDirection, setSortDirection] = useState('desc');
  const [compactColumns, setCompactColumns] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { data, error, loading } = useApiResource(() => getApiPage('/sales?limit=100'), []);
  const rows = data?.data ?? [];

  const filteredRows = useMemo(() => {
    const visibleRows = rows.filter((row) => (
      matchesQuery(row, search, [
        'id',
        'saleDate',
        'createdBy',
        (sale) => sale.customer?.name,
        (sale) => saleItemsLabel(sale.items),
      ])
      && (!openBalanceOnly || Number(row.balance) < 0)
    ));

    return sortRows(visibleRows, 'saleDate', sortDirection);
  }, [openBalanceOnly, rows, search, sortDirection]);

  const pageData = getPage(filteredRows, page, pageSize);
  const pageSizes = [10, 25, 50];

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
    { key: 'products', label: 'Products(Qty x Price)', cellClassName: 'min-w-56', render: (row) => saleItemsLabel(row.items) || 'N/A' },
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

  const visibleColumns = compactColumns
    ? columns.filter((column) => !['createdBy', 'amountPaid'].includes(column.key))
    : columns;

  return (
    <>
      <PageHeader title="Sale Management List" subtitle="View and search sales, balances, line items, and customer links." />
      <Toolbar
        placeholder="Search sales..."
        actionLabel="Add Sale"
        onAction={() => navigate('/sales/new')}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onFilter={() => {
          setOpenBalanceOnly((value) => !value);
          setPage(1);
        }}
        onSort={() => setSortDirection((value) => (value === 'asc' ? 'desc' : 'asc'))}
        onColumns={() => setCompactColumns((value) => !value)}
        filterLabel={openBalanceOnly ? 'Showing balances' : 'Show balances'}
        sortLabel={sortDirection === 'asc' ? 'Oldest' : 'Newest'}
        columnsLabel={compactColumns ? 'Full' : 'Compact'}
        filterActive={openBalanceOnly}
        columnsActive={compactColumns}
        extra={(
          <Button
            variant="secondary"
            onClick={() => {
              const nextSize = pageSizes[(pageSizes.indexOf(pageSize) + 1) % pageSizes.length];
              setPageSize(nextSize);
              setPage(1);
            }}
          >
            {pageSize} / page
          </Button>
        )}
      />
      <InlineNotice loading={loading} error={error} empty={!loading && rows.length === 0} />
      {!loading && !error ? <DataTable className="mt-7" columns={visibleColumns} rows={pageData.rows} /> : null}
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
