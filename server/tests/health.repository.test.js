import assert from 'node:assert/strict';
import test from 'node:test';
import { readRuntimeHealth } from '../src/repositories/health.repository.js';

test('readRuntimeHealth returns runtime metadata', () => {
  const result = readRuntimeHealth();

  assert.equal(typeof result.processId, 'number');
  assert.equal(typeof result.uptimeSeconds, 'number');
  assert.equal(typeof result.memoryRssBytes, 'number');
  assert.match(result.checkedAt, /^\d{4}-\d{2}-\d{2}T/);
});
