import {
  addProduct as addProductService,
  editProduct as editProductService,
  readProduct,
  readProducts,
} from '../services/product.service.js';
import { logAction } from '../services/audit-log.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getProducts(req, res) {
  const result = await readProducts(req.query);
  return sendSuccess(res, { message: 'Products loaded', data: result.data, meta: result.meta });
}

export async function getProduct(req, res) {
  const product = await readProduct(req.params.id);
  return sendSuccess(res, { message: 'Product loaded', data: product });
}

export async function createProduct(req, res) {
  const product = await addProductService(req.body, req.auth?.user);

  await logAction({
    action: 'create',
    entityType: 'product',
    entityId: product.id,
    userId: req.auth?.user?.id,
    url: req.originalUrl,
    httpMethod: req.method,
    payload: req.body,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Product created', data: product });
}

export async function updateProduct(req, res) {
  const product = await editProductService(req.params.id, req.body, req.auth?.user);

  await logAction({
    action: 'update',
    entityType: 'product',
    entityId: product.id,
    userId: req.auth?.user?.id,
    url: req.originalUrl,
    httpMethod: req.method,
    payload: req.body,
  });

  return sendSuccess(res, { message: 'Product updated', data: product });
}
