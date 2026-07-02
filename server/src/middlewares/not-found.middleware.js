import { HttpError } from '../utils/http-error.js';

export function notFoundHandler(req, res, next) {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found`));
}
