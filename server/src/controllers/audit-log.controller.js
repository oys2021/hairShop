import { readAuditLog, readAuditLogs } from '../services/audit-log.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getAuditLogs(req, res) {
  const clientIp = req.ip || req.connection.remoteAddress;
  const result = await readAuditLogs(req.query, clientIp);

  return sendSuccess(res, {
    message: 'Audit logs retrieved',
    data: result.data,
    meta: result.meta,
  });
}

export async function getAuditLog(req, res) {
  const log = await readAuditLog(req.params.id);

  if (!log) {
    throw new Error('Audit log not found');
  }

  return sendSuccess(res, {
    message: 'Audit log retrieved',
    data: log,
  });
}
