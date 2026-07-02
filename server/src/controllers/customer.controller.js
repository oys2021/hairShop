import {
  addCustomer as addCustomerService,
  editCustomer as editCustomerService,
  readCustomer,
  readCustomers,
} from '../services/customer.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getCustomers(req, res) {
  const result = await readCustomers(req.query);
  return sendSuccess(res, { message: 'Customers loaded', data: result.data, meta: result.meta });
}

export async function getCustomer(req, res) {
  const customer = await readCustomer(req.params.id);
  return sendSuccess(res, { message: 'Customer loaded', data: customer });
}

export async function createCustomer(req, res) {
  const customer = await addCustomerService(req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Customer created', data: customer });
}

export async function updateCustomer(req, res) {
  const customer = await editCustomerService(req.params.id, req.body);
  return sendSuccess(res, { message: 'Customer updated', data: customer });
}
