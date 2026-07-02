import { env } from '../config/env.js';
import { logAction } from '../services/audit-log.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function uploadImage(req, res) {
  if (!req.file) {
    throw new Error('No file uploaded');
  }

  const imageUrl = `${env.API_PREFIX}/uploads/${req.file.filename}`;
  const clientIp = req.ip || req.connection.remoteAddress;

  await logAction({
    action: 'upload',
    entityType: 'image',
    userId: req.auth?.user?.id,
    url: req.originalUrl,
    httpMethod: req.method,
    payload: {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
    ipAddress: clientIp,
  });

  return sendSuccess(res, {
    message: 'Image uploaded successfully',
    data: {
      filename: req.file.filename,
      imageUrl,
      size: req.file.size,
    },
  });
}
