import { verifySessionToken } from '../services/auth.service.js';
import { HttpError } from '../utils/http-error.js';
import { env } from '../config/env.js';

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
    if (error?.status === 401 && req.session) {
      req.session.destroy(() => {
        res.clearCookie(env.SESSION_COOKIE_NAME);
        next(error);
      });
      return;
    }

    next(error);
  });
}
