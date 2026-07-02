import {
  addUser as addUserService,
  editUser as editUserService,
  readUser,
  readUsers,
  removeUser,
} from '../services/user.service.js';
import { logAction } from '../services/audit-log.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getUsers(req, res) {
  const result = await readUsers(req.query);
  return sendSuccess(res, { message: 'Users loaded', data: result.data, meta: result.meta });
}

export async function getUser(req, res) {
  const user = await readUser(req.params.id);
  return sendSuccess(res, { message: 'User loaded', data: user });
}

export async function createUser(req, res) {
  const user = await addUserService(req.body);

  await logAction({
    action: 'create',
    entityType: 'user',
    entityId: user.id,
    userId: req.auth?.user?.id,
    url: req.originalUrl,
    httpMethod: req.method,
    payload: { username: req.body.username, email: req.body.email, role: req.body.role, status: req.body.status },
  });

  return sendSuccess(res, { statusCode: 201, message: 'User created', data: user });
}

export async function updateUser(req, res) {
  const user = await editUserService(req.params.id, req.body);

  await logAction({
    action: 'update',
    entityType: 'user',
    entityId: user.id,
    userId: req.auth?.user?.id,
    url: req.originalUrl,
    httpMethod: req.method,
    payload: req.body,
  });

  return sendSuccess(res, { message: 'User updated', data: user });
}

export async function deleteUser(req, res) {
  const result = await removeUser(req.params.id, req.auth?.user);

  await logAction({
    action: 'delete',
    entityType: 'user',
    entityId: req.params.id,
    userId: req.auth?.user?.id,
    url: req.originalUrl,
    httpMethod: req.method,
  });

  return sendSuccess(res, { message: 'User deleted', data: result });
}
