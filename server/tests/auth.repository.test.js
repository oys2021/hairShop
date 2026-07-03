import assert from 'node:assert/strict';
import test from 'node:test';
import { findUserByLogin, toPublicUser } from '../src/repositories/auth.repository.js';

test('findUserByLogin returns seeded administrator by username', async () => {
  const user = await findUserByLogin('administrator');

  assert.equal(user.username, 'administrator');
  assert.equal(user.email, 'administrator@hairmartpos.com');
});

test('toPublicUser removes password hash', async () => {
  const user = await findUserByLogin('administrator');
  const publicUser = toPublicUser(user);

  assert.equal(publicUser.username, 'administrator');
  assert.equal(publicUser.passwordHash, undefined);
});
