import { Op } from 'sequelize';
import { models } from '../database/sequelize.js';
import { createId } from '../utils/ids.js';

export async function createAuditLog({
  action,
  entityType,
  entityId,
  userId,
  url,
  httpMethod,
  payload,
  changes,
  ipAddress,
}) {
  return models.AuditLog.create({
    id: createId('aud'),
    action,
    entityType,
    entityId,
    userId,
    url,
    httpMethod,
    payload: payload ? JSON.stringify(payload) : null,
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
    const createdAt = {};
    if (startDate) createdAt[Op.gte] = new Date(startDate);
    if (endDate) createdAt[Op.lte] = new Date(endDate);
    where.createdAt = createdAt;
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
    order: [['created_at', 'DESC']],
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
