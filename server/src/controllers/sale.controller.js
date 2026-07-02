import {
  addSale as addSaleService,
  editSale as editSaleService,
  readSale,
  readSales,
} from '../services/sale.service.js';
import { logAction } from '../services/audit-log.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getSales(req, res) {
  const result = await readSales(req.query);
  return sendSuccess(res, { message: 'Sales loaded', data: result.data, meta: result.meta });
}

export async function getSale(req, res) {
  const sale = await readSale(req.params.id);
  return sendSuccess(res, { message: 'Sale loaded', data: sale });
}

export async function createSale(req, res) {
  const sale = await addSaleService(req.body, req.auth?.user);

  await logAction({
    action: 'create',
    entityType: 'sale',
    entityId: sale.id,
    userId: req.auth?.user?.id,
    url: req.originalUrl,
    httpMethod: req.method,
    payload: req.body,
  });

  return sendSuccess(res, { statusCode: 201, message: 'Sale created', data: sale });
}

export async function updateSale(req, res) {
  const sale = await editSaleService(req.params.id, req.body, req.auth?.user);

  await logAction({
    action: 'update',
    entityType: 'sale',
    entityId: sale.id,
    userId: req.auth?.user?.id,
    url: req.originalUrl,
    httpMethod: req.method,
    payload: req.body,
  });

  return sendSuccess(res, { message: 'Sale updated', data: sale });
}
