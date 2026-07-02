import { Op } from 'sequelize';
import { initializeDatabase, models } from '../database/sequelize.js';

export function saleIncludes() {
  return [
    { model: models.Customer, as: 'customer' },
    {
      model: models.SaleItem,
      as: 'items',
      include: [{ model: models.Product, as: 'product', include: [{ model: models.Category, as: 'category' }] }],
    },
  ];
}

export async function listSales({ search = '', limit, offset } = {}) {
  await initializeDatabase();

  const where = search
    ? {
        [Op.or]: [
          { id: { [Op.like]: `%${search}%` } },
          { createdBy: { [Op.like]: `%${search}%` } },
          { '$customer.name$': { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  return models.Sale.findAndCountAll({
    where,
    include: saleIncludes(),
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });
}

export async function findSaleById(id, transaction) {
  await initializeDatabase();
  return models.Sale.findByPk(id, {
    include: saleIncludes(),
    transaction,
  });
}
