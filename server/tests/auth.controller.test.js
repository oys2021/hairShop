import assert from 'node:assert/strict';
import test from 'node:test';
import { getMe, login, logout } from '../src/controllers/auth.controller.js';

function createMockResponse() {
  return {
    statusCode: null,
    body: null,
    clearedCookie: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    clearCookie(name) {
      this.clearedCookie = name;
      return this;
    },
  };
}

function createMockRequest(body = {}) {
  return {
    body,
    session: {
      auth: null,
      save(callback) {
        callback();
      },
      destroy(callback) {
        callback();
      },
    },
  };
}

test('login stores JWT in session and returns public auth response', async () => {
  const req = createMockRequest({
    username: 'administrator',
    password: 'password',
  });
  const res = createMockResponse();

  await login(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, 'Login successful');
  assert.equal(res.body.data.user.username, 'administrator');
  assert.equal(typeof req.session.auth.token, 'string');
  assert.equal(res.body.data.token, undefined);
});

test('getMe returns authenticated user from session token', async () => {
  const req = createMockRequest({
    username: 'administrator',
    password: 'password',
  });
  const loginRes = createMockResponse();
  await login(req, loginRes);

  const meRes = createMockResponse();
  await getMe(req, meRes);

  assert.equal(meRes.statusCode, 200);
  assert.equal(meRes.body.data.user.email, 'administrator@hairmartpos.com');
});

test('logout destroys session and clears cookie', async () => {
  const req = createMockRequest();
  const res = createMockResponse();

  await logout(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.clearedCookie, 'kalon.sid');
});
