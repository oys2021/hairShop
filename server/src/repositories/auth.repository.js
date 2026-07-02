import { col, fn, Op, where } from 'sequelize';
import { initializeDatabase, models } from '../database/sequelize.js';

function normalizeRole(role) {
  return role;
}

function mapUserModel(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    passwordHash: user.passwordHash,
    role: normalizeRole(user.role),
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function findUserByLogin(login) {
  await initializeDatabase();

  const normalizedLogin = String(login ?? '').trim().toLowerCase();
  const user = await models.User.findOne({
    where: {
      [Op.or]: [
        where(fn('lower', col('username')), normalizedLogin),
        where(fn('lower', col('email')), normalizedLogin),
      ],
    },
  });

  return mapUserModel(user);
}

export async function findUserById(userId) {
  await initializeDatabase();
  const user = await models.User.findByPk(userId);

  return mapUserModel(user);
}

export function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: normalizeRole(user.role),
    status: user.status,
    createdAt: user.createdAt,
  };
}
