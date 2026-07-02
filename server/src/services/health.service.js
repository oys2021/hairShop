import { env } from '../config/env.js';
import { readRuntimeHealth } from '../repositories/health.repository.js';

export function getHealthStatus() {
  return {
    service: env.APP_NAME,
    status: 'ok',
    environment: env.NODE_ENV,
    database: {
      status: 'not-configured',
    },
    runtime: readRuntimeHealth(),
  };
}
