import { Op } from 'sequelize';
import { initializeDatabase, models } from '../database/sequelize.js';

export async function listCategories({ search = '', limit, offset } = {}) {
  await initializeDatabase();

  const where = search
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  return models.Category.findAndCountAll({
    where,
    include: [{ model: models.Product, as: 'products', attributes: ['id'] }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });
}

export async function findCategoryById(id) {
  await initializeDatabase();
  return models.Category.findByPk(id, {
    include: [{ model: models.Product, as: 'products', attributes: ['id'] }],
  });
}

export async function createCategory(data) {
  await initializeDatabase();
  return models.Category.create(data);
}

export async function updateCategory(id, data) {
  const category = await findCategoryById(id);

  if (!category) {
    return null;
  }

  await category.update(data);
  return findCategoryById(id);
}
