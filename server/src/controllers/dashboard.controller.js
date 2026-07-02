import { readDashboard } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getDashboard(req, res) {
  const dashboard = await readDashboard();
  return sendSuccess(res, { message: 'Dashboard loaded', data: dashboard });
}
