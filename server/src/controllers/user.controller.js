import {
  addUser as addUserService,
  editUser as editUserService,
  readUser,
  readUsers,
  removeUser,
} from '../services/user.service.js';
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
  return sendSuccess(res, { statusCode: 201, message: 'User created', data: user });
}

export async function updateUser(req, res) {
  const user = await editUserService(req.params.id, req.body);
  return sendSuccess(res, { message: 'User updated', data: user });
}

export async function deleteUser(req, res) {
  const result = await removeUser(req.params.id, req.auth?.user);
  return sendSuccess(res, { message: 'User deleted', data: result });
}
