import { Package, ShoppingCart, UserRound, Warehouse } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import InlineNotice from '../components/InlineNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProductThumb from '../components/ProductThumb.jsx';
import { getApiData } from '../lib/api.js';
import { formatCurrency, saleItemsLabel } from '../lib/format.js';
import { useApiResource } from '../lib/useApiResource.js';

function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <article className={`relative overflow-hidden rounded-lg ${stat.color} p-7 text-white shadow-panel`}>
      <Icon className="absolute right-8 top-8 h-14 w-14 text-white/70" strokeWidth={1.8} />
      <p className="text-3xl font-black">{stat.value}</p>
      <p className="mt-1 font-black">{stat.label}</p>
      <p className="mt-2 text-xs font-bold text-white/90">{stat.meta}</p>
    </article>
  );
}

export default function DashboardPage() {
  const { data, error, loading } = useApiResource(() => getApiData('/dashboard'), []);
  const stats = [
    { label: 'Users', value: data?.summary?.users ?? 0, meta: 'staff accounts', color: 'bg-brand-orange', icon: UserRound },
    { label: 'Products', value: data?.summary?.products ?? 0, meta: 'catalog records', color: 'bg-brand-cyan', icon: Package },
    { label: 'Stock items', value: data?.summary?.stockItems ?? 0, meta: 'available units', color: 'bg-brand-navy', icon: Warehouse },
    { label: 'Sales', value: data?.summary?.sales ?? 0, meta: 'recorded sales', color: 'bg-brand-green', icon: ShoppingCart },
  ];

  const productColumns = [
    {
      key: 'name',
      label: 'Product',
      render: (row) => (
        <div className="flex items-center gap-3">
          <ProductThumb />
          <span className="max-w-[150px] truncate font-black">{row.name}</span>
        </div>
      ),
    },
    { key: 'id', label: 'ID' },
    { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
    { key: 'qtyInStock', label: 'Qty' },
    { key: 'createdBy', label: 'By', render: (row) => row.createdBy ?? 'N/A' },
  ];

  const saleColumns = [
    { key: 'id', label: 'Sale ID' },
    { key: 'customer', label: 'Customer', render: (row) => row.customer?.name ?? 'N/A' },
    { key: 'totalAmount', label: 'Total', render: (row) => formatCurrency(row.totalAmount) },
    { key: 'amountPaid', label: 'Paid', render: (row) => formatCurrency(row.amountPaid) },
    {
      key: 'balance',
      label: 'Balance',
      render: (row) => <span className={Number(row.balance) < 0 ? 'font-black text-brand-red' : ''}>{formatCurrency(row.balance)}</span>,
    },
    { key: 'items', label: 'Products', render: (row) => saleItemsLabel(row.items) },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live counts, stock movement, and recent sales activity." />
      <InlineNotice loading={loading} error={error} />
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="mt-7 grid gap-7 xl:grid-cols-2">
        <div className="panel p-6">
          <h2 className="mb-5 text-xl font-black">Recently Added Products</h2>
          <DataTable columns={productColumns} rows={data?.recentProducts ?? []} />
        </div>
        <div className="panel p-6">
          <h2 className="mb-5 text-xl font-black">Recently Added Sale</h2>
          <DataTable columns={saleColumns} rows={data?.recentSales ?? []} />
        </div>
      </section>

      <section className="panel mt-7 p-7">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-black">Inventory Health</h2>
          <span className="rounded-full bg-orange-100 px-5 py-2 text-xs font-black text-brand-orange">{data?.summary?.stockItems ?? 0} stock items</span>
        </div>
        <div className="flex h-36 items-end justify-between gap-4 border-b border-brand-line px-4">
          {(data?.inventory ?? []).map((bar) => (
            <div key={bar.label} className="flex flex-1 flex-col items-center justify-end gap-3">
              <div className="flex w-14 items-end justify-center rounded-lg bg-orange-100" style={{ height: `${Math.max(22, Math.min(96, bar.value))}px` }}>
                <div className="mb-0 w-6 rounded-t-lg bg-brand-orange" style={{ height: `${Math.max(18, Math.min(76, bar.value * 0.72))}px` }} />
              </div>
              <span className="pb-3 text-xs text-brand-muted">{bar.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
