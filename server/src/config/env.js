import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const defaultStoragePath = fileURLToPath(new URL('../../data/kalon-pos.sqlite', import.meta.url));

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const sessionSecret = process.env.SESSION_SECRET ?? 'dev-session-secret-change-me';
const jwtSecret = process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me';

if (nodeEnv === 'production') {
  if (sessionSecret.startsWith('dev-') || jwtSecret.startsWith('dev-')) {
    throw new Error('SESSION_SECRET and JWT_SECRET must be configured in production.');
  }
}

export const env = Object.freeze({
  NODE_ENV: nodeEnv,
  PORT: toNumber(process.env.PORT, 5090),
  API_PREFIX: process.env.API_PREFIX ?? '/api/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://127.0.0.1:5175',
  APP_NAME: process.env.APP_NAME ?? 'Kalon POS API',
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? 'kalon.sid',
  SESSION_SECRET: sessionSecret,
  SESSION_TTL_MINUTES: toNumber(process.env.SESSION_TTL_MINUTES, 480),
  COOKIE_SECURE: toBoolean(process.env.COOKIE_SECURE, nodeEnv === 'production'),
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '8h',
  JWT_ISSUER: process.env.JWT_ISSUER ?? 'kalon-pos-api',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE ?? 'kalon-pos-admin',
  DB_DIALECT: process.env.DB_DIALECT ?? 'sqlite',
  DB_HOST: process.env.DB_HOST ?? '127.0.0.1',
  DB_PORT: toNumber(process.env.DB_PORT, 5432),
  DB_NAME: process.env.DB_NAME ?? 'kalon_pos',
  DB_USER: process.env.DB_USER ?? 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  DB_LOGGING: toBoolean(process.env.DB_LOGGING, false),
  DB_STORAGE: process.env.DB_STORAGE
    ? path.resolve(process.cwd(), process.env.DB_STORAGE)
    : defaultStoragePath,
});
