import {
  createCategory,
  findCategoryById,
  listCategories,
  updateCategory,
} from '../repositories/category.repository.js';
import { createSequentialId } from '../utils/ids.js';
import { buildPaginationMeta, readPagination } from '../utils/pagination.js';
import { models } from '../database/sequelize.js';
import { HttpError } from '../utils/http-error.js';

function serializeCategory(category) {
  const data = category.toJSON();
  return {
    ...data,
    productsCount: category.products?.length ?? 0,
  };
}

export async function readCategories(query) {
  const pagination = readPagination(query);
  const result = await listCategories({ ...pagination, search: query.search });

  return {
    data: result.rows.map(serializeCategory),
    meta: buildPaginationMeta({ count: result.count, ...pagination }),
  };
}

export async function readCategory(id) {
  const category = await findCategoryById(id);

  if (!category) {
    throw new HttpError(404, 'Category not found');
  }

  return serializeCategory(category);
}

export async function addCategory(payload, authUser) {
  if (!payload.name || !payload.code) {
    throw new HttpError(400, 'Category name and code are required');
  }

  const category = await createCategory({
    id: payload.id ?? await createSequentialId(models.Category, 'CT'),
    name: payload.name.trim(),
    code: payload.code.trim(),
    createdBy: authUser?.username ?? 'administrator',
  });

  return serializeCategory(category);
}

export async function editCategory(id, payload) {
  const category = await updateCategory(id, {
    ...(payload.name ? { name: payload.name.trim() } : {}),
    ...(payload.code ? { code: payload.code.trim() } : {}),
  });

  if (!category) {
    throw new HttpError(404, 'Category not found');
  }

  return serializeCategory(category);
}
