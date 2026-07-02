import assert from 'node:assert/strict';
import test from 'node:test';
import { authenticateUser, getAuthenticatedSession, verifySessionToken } from '../src/services/auth.service.js';

test('authenticateUser returns public user and session token', async () => {
  const result = await authenticateUser({
    username: 'administrator',
    password: 'password',
  });

  assert.equal(result.user.username, 'administrator');
  assert.equal(result.tokenStorage, 'server-session');
  assert.equal(typeof result.token, 'string');
});

test('verifySessionToken verifies token stored in session', async () => {
  const login = await authenticateUser({
    username: 'administrator',
    password: 'password',
  });

  const result = await verifySessionToken(login.token);

  assert.equal(result.user.email, 'administrator@kalonpos.com');
  assert.equal(result.claims.username, 'administrator');
});

test('getAuthenticatedSession returns safe session data', async () => {
  const login = await authenticateUser({
    username: 'administrator',
    password: 'password',
  });

  const result = await getAuthenticatedSession(login.token);

  assert.equal(result.user.username, 'administrator');
  assert.equal(result.claims.role, 'admin');
});

test('authenticateUser rejects wrong credentials', async () => {
  await assert.rejects(
    () =>
      authenticateUser({
        username: 'administrator',
        password: 'wrong-password',
      }),
    /Invalid username or password/,
  );
});
