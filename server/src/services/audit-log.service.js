import {
  createAuditLog,
  findAuditLogById,
  listAuditLogs,
} from '../repositories/audit-log.repository.js';
import { buildPaginationMeta, readPagination } from '../utils/pagination.js';

function serializeAuditLog(log) {
  return log.toJSON();
}

export async function readAuditLogs(query, clientIp) {
  const pagination = readPagination(query);

  const result = await listAuditLogs({
    ...pagination,
    action: query.action,
    entityType: query.entityType,
    userId: query.userId,
    startDate: query.startDate,
    endDate: query.endDate,
  });

  return {
    data: result.rows.map(serializeAuditLog),
    meta: buildPaginationMeta({ count: result.count, ...pagination }),
  };
}

export async function readAuditLog(id) {
  const log = await findAuditLogById(id);
  return log ? serializeAuditLog(log) : null;
}

export async function logAction({
  action,
  entityType,
  entityId,
  userId,
  changes,
  ipAddress,
}) {
  return createAuditLog({
    action,
    entityType,
    entityId,
    userId,
    changes,
    ipAddress,
  });
}
