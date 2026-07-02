import { Op } from 'sequelize';
import { initializeDatabase, models } from '../database/sequelize.js';

export async function listCustomers({ search = '', limit, offset } = {}) {
  await initializeDatabase();

  const where = search
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  return models.Customer.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
}

export async function findCustomerById(id) {
  await initializeDatabase();
  return models.Customer.findByPk(id);
}

export async function createCustomer(data) {
  await initializeDatabase();
  return models.Customer.create(data);
}

export async function updateCustomer(id, data) {
  const customer = await findCustomerById(id);

  if (!customer) {
    return null;
  }

  await customer.update(data);
  return customer;
}
