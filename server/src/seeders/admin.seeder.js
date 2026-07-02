import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { models } from '../models/index.js';

export async function seedAdministrator(
  {
    id = 'usr_admin_001',
    username = process.env.ADMIN_USERNAME ?? 'administrator',
    email = process.env.ADMIN_EMAIL ?? 'administrator@hairmartpos.com',
    password = process.env.ADMIN_PASSWORD ?? 'password1234',
    role = process.env.ADMIN_ROLE ?? 'admin',
    status = 'active',
  } = {},
) {
  const { User } = models;

  if (!User) {
    throw new Error('User model is not initialized.');
  }

  const existing = await User.findOne({
    where: {
      [Op.or]: [
        { username },
        { email },
      ],
    },
  });

  if (existing) {
    const shouldRefreshDefaultEmail =
      existing.username === username
      && existing.email !== email
      && String(existing.email ?? '').endsWith('@kalonpos.com');

    if (shouldRefreshDefaultEmail) {
      await existing.update({ email });
    }

    return {
      created: false,
      user: existing.toPublicJSON(),
    };
  }

  const user = await User.create({
    id,
    username,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    status,
  });

  return {
    created: true,
    user: user.toPublicJSON(),
  };
}
