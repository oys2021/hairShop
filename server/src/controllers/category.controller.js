import {
  addCategory as addCategoryService,
  editCategory as editCategoryService,
  readCategories,
  readCategory,
} from '../services/category.service.js';
import { logAction } from '../services/audit-log.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getCategories(req, res) {
  const result = await readCategories(req.query);
  return sendSuccess(res, { message: 'Categories loaded', data: result.data, meta: result.meta });
}

export async function getCategory(req, res) {
  const category = await readCategory(req.params.id);
  return sendSuccess(res, { message: 'Category loaded', data: category });
}

export async function createCategory(req, res) {
  const category = await addCategoryService(req.body, req.auth?.user);

  await logAction({
    action: 'create',
    entityType: 'category',
    entityId: category.id,
    userId: req.auth?.user?.id,
    url: req.originalUrl,
    httpMethod: req.method,
    payload: req.body,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Category created', data: category });
}

export async function updateCategory(req, res) {
  const category = await editCategoryService(req.params.id, req.body);

  await logAction({
    action: 'update',
    entityType: 'category',
    entityId: category.id,
    userId: req.auth?.user?.id,
    url: req.originalUrl,
    httpMethod: req.method,
    payload: req.body,
  });

  return sendSuccess(res, { message: 'Category updated', data: category });
}
