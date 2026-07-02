import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import DataTable from '../components/DataTable.jsx';
import FormField from '../components/FormField.jsx';
import InlineNotice from '../components/InlineNotice.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { apiFetch, getApiData, getApiPage } from '../lib/api.js';
import { formatCurrency } from '../lib/format.js';
import { useApiResource } from '../lib/useApiResource.js';

export default function SaleFormPage({ mode = 'add' }) {
  const isEdit = mode === 'edit';
  const { saleId } = useParams();
  const navigate = useNavigate();
  const products = useApiResource(() => getApiPage('/products?limit=100'), []);
  const customers = useApiResource(() => getApiPage('/customers?limit=100'), []);
  const sale = useApiResource(() => (isEdit ? getApiData(`/sales/${saleId}`) : Promise.resolve(null)), [isEdit, saleId]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [items, setItems] = useState([]);
  const [amountPaid, setAmountPaid] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sale.data) {
      setItems(
        sale.data.items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        })),
      );
      setAmountPaid(String(sale.data.amountPaid ?? ''));
      setCustomerId(sale.data.customerId ?? '');
    }
  }, [sale.data]);

  const productRows = products.data?.data ?? [];
  const customerRows = customers.data?.data ?? [];
  const productMap = useMemo(() => new Map(productRows.map((product) => [product.id, product])), [productRows]);
  const tableRows = items.map((item) => {
    const product = productMap.get(item.productId);
    const unitPrice = Number(product?.price ?? 0);
    return {
      ...item,
      id: item.productId,
      product: product?.name ?? item.productId,
      unitPrice,
      lineTotal: unitPrice * Number(item.qty),
      stock: product?.qtyInStock ?? 0,
    };
  });
  const subtotal = tableRows.reduce((total, item) => total + item.lineTotal, 0);
  const balance = Number(amountPaid || 0) - subtotal;

  const addItem = () => {
    if (!selectedProductId || Number(selectedQty) <= 0) {
      return;
    }

    setItems((current) => {
      const existing = current.find((item) => item.productId === selectedProductId);
      if (existing) {
        return current.map((item) =>
          item.productId === selectedProductId ? { ...item, qty: Number(item.qty) + Number(selectedQty) } : item,
        );
      }

      return [...current, { productId: selectedProductId, qty: Number(selectedQty) }];
    });
    setSelectedProductId('');
    setSelectedQty(1);
  };

  const submitSale = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch(isEdit ? `/sales/${saleId}` : '/sales', {
        method: isEdit ? 'PUT' : 'POST',
        body: {
          customerId,
          amountPaid: Number(amountPaid || 0),
          items,
        },
      });
      navigate('/sales');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'product', label: 'Product', render: (row) => <span className="font-black">{row.product}</span> },
    {
      key: 'qty',
      label: 'Qty',
      render: (row) => (
        <input
          className="control h-9 w-24"
          value={row.qty}
          type="number"
          min="1"
          onChange={(event) =>
            setItems((current) =>
              current.map((item) => (item.productId === row.productId ? { ...item, qty: Number(event.target.value) } : item)),
            )
          }
        />
      ),
    },
    { key: 'unitPrice', label: 'Unit price', render: (row) => formatCurrency(row.unitPrice) },
    { key: 'lineTotal', label: 'Line total', render: (row) => formatCurrency(row.lineTotal) },
    {
      key: 'remove',
      label: '',
      render: (row) => (
        <Button variant="secondary" className="h-8 px-3" onClick={() => setItems((current) => current.filter((item) => item.productId !== row.productId))}>
          <Trash2 size={15} />
          Remove
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={isEdit ? 'Update Sale' : 'Add New Sale'}
        subtitle={isEdit ? 'Recalculate totals and reconcile stock deltas from edited line items.' : 'Create a sale, update stock, and assign the customer in one transaction.'}
      />
      <InlineNotice loading={products.loading || customers.loading || sale.loading} error={products.error || customers.error || sale.error} />

      <section className="grid gap-7 xl:grid-cols-[minmax(0,690px)_378px]">
        <form className="panel p-7" onSubmit={submitSale}>
          <h2 className="mb-8 text-2xl font-black">{isEdit ? 'Editable Line Items' : 'Sale Items'}</h2>

          <div className="mb-8 grid gap-4 md:grid-cols-[1fr_110px_140px]">
            <FormField label="Search Product">
              <select className="control w-full" value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
                <option value="">Select product</option>
                {productRows.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.qtyInStock} in stock)
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Quantity">
              <input className="control w-full" value={selectedQty} type="number" min="1" onChange={(event) => setSelectedQty(Number(event.target.value))} />
            </FormField>
            <Button className="mt-6 h-[44px]" onClick={addItem}>Add Item</Button>
          </div>

          <DataTable columns={columns} rows={tableRows} />

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <FormField label="Paid Price">
              <input className="control w-full" value={amountPaid} onChange={(event) => setAmountPaid(event.target.value)} type="number" min="0" step="0.01" />
            </FormField>
            <FormField label="Select Customer">
              <select className="control w-full" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                <option value="">-- Select Customer --</option>
                {customerRows.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="mt-24 flex justify-end gap-4">
            <Button variant="muted" onClick={() => navigate('/sales')}>Cancel</Button>
            <Button type="submit" disabled={saving || tableRows.length === 0}>{saving ? 'Saving...' : isEdit ? 'Submit Update' : 'Submit Sale'}</Button>
          </div>
        </form>

        <aside className="panel h-fit p-7">
          <h2 className="text-2xl font-black">{isEdit ? 'Stock Reconciliation' : 'Running Total'}</h2>
          <dl className="mt-8 space-y-6 border-t border-brand-line pt-8">
            <div className="flex justify-between">
              <dt className="text-brand-muted">Subtotal</dt>
              <dd className="font-black">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-muted">Amount paid</dt>
              <dd className="font-black">{formatCurrency(amountPaid || 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-muted">Balance</dt>
              <dd className={`text-xl font-black ${balance < 0 ? 'text-brand-red' : ''}`}>{formatCurrency(balance)}</dd>
            </div>
          </dl>
          <div className="mt-8 rounded-lg bg-orange-50 p-6 text-sm text-brand-orange">
            <p className="font-black">Stock check</p>
            <p className="mt-3">The backend validates stock again before saving.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
