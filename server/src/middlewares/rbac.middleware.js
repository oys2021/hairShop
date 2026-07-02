import { HttpError } from '../utils/http-error.js';

export function allowRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = req.auth?.user?.role;

    if (!role) {
      next(new HttpError(401, 'Authentication required'));
      return;
    }

    if (!allowedRoles.includes(role)) {
      next(new HttpError(403, 'Access denied'));
      return;
    }

    next();
  };
}
