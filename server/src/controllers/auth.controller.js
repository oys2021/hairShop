import { env } from '../config/env.js';
import {
  authenticateUser,
  getAuthenticatedSession,
  requestPasswordReset,
  resetPassword,
} from '../services/auth.service.js';
import { logAction } from '../services/audit-log.service.js';
import { sendSuccess } from '../utils/api-response.js';

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function destroySession(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export async function login(req, res) {
  const authenticated = await authenticateUser(req.body);
  const clientIp = req.ip || req.connection.remoteAddress;

  req.session.auth = {
    token: authenticated.token,
    userId: authenticated.user.id,
    loggedInAt: new Date().toISOString(),
  };

  await saveSession(req);

  await logAction({
    action: 'login',
    userId: authenticated.user.id,
    url: req.originalUrl,
    httpMethod: req.method,
    payload: { username: req.body.username },
    ipAddress: clientIp,
  });

  return sendSuccess(res, {
    message: 'Login successful',
    data: {
      user: authenticated.user,
      auth: {
        strategy: 'session-cookie',
        tokenStorage: authenticated.tokenStorage,
        cookie: {
          httpOnly: true,
          secureInProduction: true,
        },
      },
    },
  });
}

export async function getMe(req, res) {
  const session = await getAuthenticatedSession(req.session.auth.token);

  return sendSuccess(res, {
    message: 'Authenticated session found',
    data: session,
  });
}

export async function logout(req, res) {
  const clientIp = req.ip || req.connection.remoteAddress;
  const userId = req.session.auth?.userId;

  await destroySession(req);
  res.clearCookie(env.SESSION_COOKIE_NAME);

  if (userId) {
    await logAction({
      action: 'logout',
      userId,
      url: req.originalUrl,
      httpMethod: req.method,
      ipAddress: clientIp,
    });
  }

  return sendSuccess(res, {
    message: 'Logout successful',
  });
}

export async function forgotPassword(req, res) {
  const result = await requestPasswordReset(req.body);

  return sendSuccess(res, {
    message: 'Password reset request accepted',
    data: result,
  });
}

export async function resetUserPassword(req, res) {
  const result = await resetPassword(req.body);

  return sendSuccess(res, {
    message: 'Password reset successful',
    data: result,
  });
}
