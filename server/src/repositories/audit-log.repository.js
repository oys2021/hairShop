import { models } from '../database/sequelize.js';
import { createId } from '../utils/ids.js';

export async function createAuditLog({
  action,
  entityType,
  entityId,
  userId,
  changes,
  ipAddress,
}) {
  return models.AuditLog.create({
    id: createId('aud'),
    action,
    entityType,
    entityId,
    userId,
    changes: changes ? JSON.stringify(changes) : null,
    ipAddress,
  });
}

export async function listAuditLogs({
  limit = 50,
  offset = 0,
  action,
  entityType,
  userId,
  startDate,
  endDate,
}) {
  const where = {};

  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (userId) where.userId = userId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.$gte = new Date(startDate);
    if (endDate) where.createdAt.$lte = new Date(endDate);
  }

  const result = await models.AuditLog.findAndCountAll({
    where,
    include: [
      {
        model: models.User,
        as: 'user',
        attributes: ['id', 'username'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return {
    rows: result.rows,
    count: result.count,
  };
}

export async function findAuditLogById(id) {
  return models.AuditLog.findByPk(id, {
    include: [
      {
        model: models.User,
        as: 'user',
        attributes: ['id', 'username'],
      },
    ],
  });
}
