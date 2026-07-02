import {
  createCustomer,
  findCustomerById,
  listCustomers,
  updateCustomer,
} from '../repositories/customer.repository.js';
import { createId } from '../utils/ids.js';
import { buildPaginationMeta, readPagination } from '../utils/pagination.js';
import { HttpError } from '../utils/http-error.js';

export async function readCustomers(query) {
  const pagination = readPagination(query);
  const result = await listCustomers({ ...pagination, search: query.search });

  return {
    data: result.rows.map((customer) => customer.toJSON()),
    meta: buildPaginationMeta({ count: result.count, ...pagination }),
  };
}

export async function readCustomer(id) {
  const customer = await findCustomerById(id);

  if (!customer) {
    throw new HttpError(404, 'Customer not found');
  }

  return customer.toJSON();
}

export async function addCustomer(payload) {
  if (!payload.name) {
    throw new HttpError(400, 'Customer name is required');
  }

  const customer = await createCustomer({
    id: payload.id ?? createId('cus'),
    name: payload.name.trim(),
    phone: payload.phone?.trim() || null,
    email: payload.email?.trim() || null,
  });

  return customer.toJSON();
}

export async function editCustomer(id, payload) {
  const customer = await updateCustomer(id, {
    ...(payload.name ? { name: payload.name.trim() } : {}),
    ...(payload.phone !== undefined ? { phone: payload.phone?.trim() || null } : {}),
    ...(payload.email !== undefined ? { email: payload.email?.trim() || null } : {}),
  });

  if (!customer) {
    throw new HttpError(404, 'Customer not found');
  }

  return customer.toJSON();
}
