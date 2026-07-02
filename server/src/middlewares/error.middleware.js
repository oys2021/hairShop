import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode ?? 500;

  logger.error(`${req.method} ${req.originalUrl} failed`, error);

  res.status(statusCode).json({
    success: false,
    message: error.message ?? 'Internal server error',
    ...(env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  });
}
