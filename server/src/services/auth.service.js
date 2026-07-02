import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { initializeDatabase, models } from '../database/sequelize.js';
import { findUserById, findUserByLogin, toPublicUser } from '../repositories/auth.repository.js';
import { createId } from '../utils/ids.js';
import { HttpError } from '../utils/http-error.js';

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
  );
}

export async function authenticateUser({ username, password } = {}) {
  if (!username || !password) {
    throw new HttpError(400, 'Username and password are required');
  }

  const user = await findUserByLogin(username);

  if (!user) {
    throw new HttpError(401, 'Invalid username or password');
  }

  if (user.status !== 'active') {
    throw new HttpError(403, 'User account is not active');
  }

  const passwordMatches = bcrypt.compareSync(password, user.passwordHash);

  if (!passwordMatches) {
    throw new HttpError(401, 'Invalid username or password');
  }

  return {
    token: signAccessToken(user),
    user: toPublicUser(user),
    tokenStorage: 'server-session',
  };
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function requestPasswordReset({ username, email } = {}) {
  const login = username ?? email;

  if (!login) {
    throw new HttpError(400, 'Username or email is required');
  }

  await initializeDatabase();
  const user = await findUserByLogin(login);

  if (!user) {
    return {
      accepted: true,
      message: 'If the account exists, a reset token has been generated',
    };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await models.PasswordResetToken.create({
    id: createId('prt'),
    userId: user.id,
    tokenHash: hashResetToken(token),
    expiresAt,
  });

  return {
    accepted: true,
    resetToken: token,
    expiresAt,
  };
}

export async function resetPassword({ token, password } = {}) {
  if (!token || !password) {
    throw new HttpError(400, 'Reset token and new password are required');
  }

  await initializeDatabase();
  const resetToken = await models.PasswordResetToken.findOne({
    where: {
      tokenHash: hashResetToken(token),
      usedAt: null,
    },
    include: [{ model: models.User, as: 'user' }],
    order: [['created_at', 'DESC']],
  });

  if (!resetToken || new Date(resetToken.expiresAt).getTime() < Date.now()) {
    throw new HttpError(400, 'Reset token is invalid or expired');
  }

  await resetToken.user.update({
    passwordHash: bcrypt.hashSync(password, 10),
  });
  await resetToken.update({ usedAt: new Date() });

  return {
    user: toPublicUser(resetToken.user),
  };
}

export async function verifySessionToken(token) {
  if (!token) {
    throw new HttpError(401, 'Missing session token');
  }

  let claims;

  try {
    claims = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
  } catch (error) {
    throw new HttpError(401, 'Invalid or expired session token');
  }

  const user = await findUserById(claims.sub);

  if (!user || user.status !== 'active') {
    throw new HttpError(401, 'Authenticated user no longer exists');
  }

  return {
    claims,
    user: toPublicUser(user),
  };
}

export async function getAuthenticatedSession(token) {
  const authenticated = await verifySessionToken(token);

  return {
    user: authenticated.user,
    claims: {
      subject: authenticated.claims.sub,
      role: authenticated.claims.role,
      issuer: authenticated.claims.iss,
      audience: authenticated.claims.aud,
      expiresAt: authenticated.claims.exp,
    },
  };
}
