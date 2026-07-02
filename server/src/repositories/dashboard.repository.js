import { fn, col } from 'sequelize';
import { initializeDatabase, models } from '../database/sequelize.js';
import { saleIncludes } from './sale.repository.js';

export async function readDashboardSummary() {
  await initializeDatabase();

  const [users, products, stockItems, sales] = await Promise.all([
    models.User.count(),
    models.Product.count(),
    models.Product.sum('qtyInStock'),
    models.Sale.count(),
  ]);

  return {
    users,
    products,
    stockItems: Number(stockItems ?? 0),
    sales,
  };
}

export async function readInventoryHealth() {
  await initializeDatabase();

  return models.Product.findAll({
    attributes: ['categoryId', [fn('SUM', col('qty_in_stock')), 'stock']],
    include: [{ model: models.Category, as: 'category', attributes: ['name'] }],
    group: ['Product.category_id', 'category.id'],
    order: [[fn('SUM', col('qty_in_stock')), 'DESC']],
    limit: 8,
  });
}

export async function readRecentProducts(limit = 5) {
  await initializeDatabase();

  return models.Product.findAll({
    include: [{ model: models.Category, as: 'category' }],
    order: [['created_at', 'DESC']],
    limit,
  });
}

export async function readRecentSales(limit = 5) {
  await initializeDatabase();

  return models.Sale.findAll({
    include: saleIncludes(),
    order: [['created_at', 'DESC']],
    limit,
  });
}
