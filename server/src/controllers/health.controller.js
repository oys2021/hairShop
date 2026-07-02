import { getHealthStatus } from '../services/health.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getHealthCheck(req, res) {
  const health = getHealthStatus();

  return sendSuccess(res, {
    message: 'Backend is healthy',
    data: health,
  });
}



