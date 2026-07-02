export function formatCurrency(value) {
  const amount = Number(value ?? 0);
  const sign = amount < 0 ? '-' : '';
  return `${sign}GHC${Math.abs(amount).toFixed(2)}`;
}

export function formatDate(value) {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function saleItemsLabel(items = []) {
  return items.map((item) => `${item.product?.name ?? item.productId} - ${item.qty} x ${formatCurrency(item.unitPrice)}`).join(', ');
}
