import {
  readDashboardSummary,
  readInventoryHealth,
  readRecentProducts,
  readRecentSales,
} from '../repositories/dashboard.repository.js';

export async function readDashboard() {
  const [summary, recentProducts, recentSales, inventory] = await Promise.all([
    readDashboardSummary(),
    readRecentProducts(5),
    readRecentSales(5),
    readInventoryHealth(),
  ]);

  return {
    summary,
    recentProducts: recentProducts.map((product) => product.toJSON()),
    recentSales: recentSales.map((sale) => sale.toJSON()),
    inventory: inventory.map((row) => ({
      label: row.category?.name ?? 'Other',
      value: Number(row.get('stock') ?? 0),
    })),
  };
}
