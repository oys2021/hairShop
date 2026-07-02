import assert from 'node:assert/strict';
import test from 'node:test';
import { getHealthCheck } from '../src/controllers/health.controller.js';

function createMockResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('getHealthCheck sends a successful response', async () => {
  const res = createMockResponse();

  await getHealthCheck({}, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, 'Backend is healthy');
  assert.equal(res.body.data.status, 'ok');
});
