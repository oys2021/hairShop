import { Op } from 'sequelize';
import { initializeDatabase, models } from '../database/sequelize.js';

const productInclude = [{ model: models.Category, as: 'category' }];

export async function listProducts({ search = '', categoryId, limit, offset, sort = 'recent' } = {}) {
  await initializeDatabase();

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          [Op.or]: [
            { id: { [Op.like]: `%${search}%` } },
            { name: { [Op.like]: `%${search}%` } },
          ],
        }
      : {}),
  };

  const order = sort === 'name' ? [['name', 'ASC']] : [['created_at', 'DESC']];

  return models.Product.findAndCountAll({
    where,
    include: productInclude,
    order,
    limit,
    offset,
    distinct: true,
  });
}

export async function findProductById(id, transaction) {
  await initializeDatabase();
  return models.Product.findByPk(id, {
    include: productInclude,
    transaction,
  });
}

export async function createProduct(data, transaction) {
  await initializeDatabase();
  return models.Product.create(data, { transaction });
}

export async function updateProduct(id, data, transaction) {
  const product = await findProductById(id, transaction);

  if (!product) {
    return null;
  }

  await product.update(data, { transaction });
  return findProductById(id, transaction);
}

export async function createStockMovement(data, transaction) {
  await initializeDatabase();
  return models.StockMovement.create(data, { transaction });
}
