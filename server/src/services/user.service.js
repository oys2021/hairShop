import {
  createUser,
  deleteUser,
  findUserById,
  listUsers,
  updateUser,
} from '../repositories/user.repository.js';
import { createId } from '../utils/ids.js';
import { buildPaginationMeta, readPagination } from '../utils/pagination.js';
import { HttpError } from '../utils/http-error.js';
import { toPublicUser } from '../repositories/auth.repository.js';

export async function readUsers(query) {
  const pagination = readPagination(query);
  const result = await listUsers({ ...pagination, search: query.search });

  return {
    data: result.rows.map(toPublicUser),
    meta: buildPaginationMeta({ count: result.count, ...pagination }),
  };
}

export async function readUser(id) {
  const user = await findUserById(id);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return toPublicUser(user);
}

export async function addUser(payload) {
  if (!payload.username || !payload.email || !payload.password) {
    throw new HttpError(400, 'Username, email, and password are required');
  }

  const user = await createUser({
    id: payload.id ?? createId('usr'),
    username: payload.username.trim(),
    email: payload.email.trim(),
    password: payload.password,
    role: payload.role ?? 'staff',
    status: payload.status ?? 'active',
  });

  return toPublicUser(user);
}

export async function editUser(id, payload) {
  const user = await updateUser(id, {
    ...(payload.username ? { username: payload.username.trim() } : {}),
    ...(payload.email ? { email: payload.email.trim() } : {}),
    ...(payload.role ? { role: payload.role } : {}),
    ...(payload.status ? { status: payload.status } : {}),
    ...(payload.password ? { password: payload.password } : {}),
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return toPublicUser(user);
}

export async function removeUser(id, authUser) {
  if (authUser?.id === id) {
    throw new HttpError(400, 'You cannot delete your own account');
  }

  const removed = await deleteUser(id);

  if (!removed) {
    throw new HttpError(404, 'User not found');
  }

  return { id };
}
