import { verifySessionToken } from '../services/auth.service.js';
import { HttpError } from '../utils/http-error.js';

export function requireAuth(req, res, next) {
  Promise.resolve().then(async () => {
    const token = req.session?.auth?.token;

    if (!token) {
      throw new HttpError(401, 'Authentication required');
    }

    const authenticated = await verifySessionToken(token);
    req.auth = authenticated;
    next();
  }).catch((error) => {
    next(error);
  });
}
