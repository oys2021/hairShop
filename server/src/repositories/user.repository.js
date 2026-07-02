import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { initializeDatabase, models } from '../database/sequelize.js';

export async function listUsers({ search = '', limit, offset } = {}) {
  await initializeDatabase();

  const where = search
    ? {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { role: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  return models.User.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
}

export async function findUserById(id) {
  await initializeDatabase();
  return models.User.findByPk(id);
}

export async function createUser(data) {
  await initializeDatabase();
  return models.User.create({
    ...data,
    passwordHash: bcrypt.hashSync(data.password, 10),
  });
}

export async function updateUser(id, data) {
  const user = await findUserById(id);

  if (!user) {
    return null;
  }

  const changes = { ...data };
  if (data.password) {
    changes.passwordHash = bcrypt.hashSync(data.password, 10);
  }
  delete changes.password;

  await user.update(changes);
  return user;
}

export async function deleteUser(id) {
  const user = await findUserById(id);

  if (!user) {
    return false;
  }

  await user.destroy();
  return true;
}
