import { useParams } from 'react-router-dom';
import DataTable from '../components/DataTable.jsx';
import InlineNotice from '../components/InlineNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProductThumb from '../components/ProductThumb.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { getApiData } from '../lib/api.js';
import { formatCurrency } from '../lib/format.js';
import { useApiResource } from '../lib/useApiResource.js';

export default function SaleDetailsPage() {
  const { saleId } = useParams();
  const { data: sale, error, loading } = useApiResource(() => getApiData(`/sales/${saleId}`), [saleId]);
  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (row) => (
        <div className="flex items-center gap-3">
          <ProductThumb />
          <span className="font-black">{row.product?.name ?? row.productId}</span>
        </div>
      ),
    },
    { key: 'qty', label: 'Qty' },
    { key: 'unitPrice', label: 'Unit price', render: (row) => formatCurrency(row.unitPrice) },
    { key: 'lineTotal', label: 'Line total', render: (row) => formatCurrency(row.lineTotal) },
  ];

  return (
    <>
      <PageHeader title="Sale Details" subtitle="Read-only transaction record with customer and itemized products." />
      <InlineNotice loading={loading} error={error} />
      {!loading && !error && sale ? (
        <>
      <section className="panel p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h2 className="text-2xl font-black">Sale ID: {sale.id}</h2>
          <StatusBadge tone={Number(sale.balance) < 0 ? 'red' : 'green'}>{Number(sale.balance) < 0 ? 'Open' : 'Paid'}</StatusBadge>
        </div>
        <dl className="mt-9 grid gap-7 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-black text-slate-500">Customer</dt>
            <dd className="mt-3 text-lg font-black">{sale.customer?.name ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-xs font-black text-slate-500">Date</dt>
            <dd className="mt-3 text-lg font-black">{sale.saleDate}</dd>
          </div>
          <div>
            <dt className="text-xs font-black text-slate-500">Created by</dt>
            <dd className="mt-3 text-lg font-black">{sale.createdBy ?? 'N/A'}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,880px)_186px]">
        <DataTable columns={columns} rows={sale.items ?? []} />
        <aside className="panel h-fit p-6">
          <h2 className="text-xl font-black">Totals</h2>
          <dl className="mt-8 space-y-7">
            <div>
              <dt className="text-xs text-brand-muted">Grand total</dt>
              <dd className="mt-2 text-lg font-black">{formatCurrency(sale.totalAmount)}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Amount paid</dt>
              <dd className="mt-2 text-lg font-black">{formatCurrency(sale.amountPaid)}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Balance</dt>
              <dd className={`mt-2 text-lg font-black ${Number(sale.balance) < 0 ? 'text-brand-red' : ''}`}>{formatCurrency(sale.balance)}</dd>
            </div>
          </dl>
        </aside>
      </section>
        </>
      ) : null}
    </>
  );
}
