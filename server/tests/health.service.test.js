import assert from 'node:assert/strict';
import test from 'node:test';
import { getHealthStatus } from '../src/services/health.service.js';

test('getHealthStatus returns api health state', () => {
  const result = getHealthStatus();

  assert.equal(result.status, 'ok');
  assert.equal(result.database.status, 'not-configured');
  assert.equal(typeof result.runtime.checkedAt, 'string');
});
