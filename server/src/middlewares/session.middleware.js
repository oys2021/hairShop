import session from 'express-session';
import { sessionConfig } from '../config/session.js';

// Local development uses the default in-memory store.
// Replace this with Redis or another durable store before production.
export const sessionMiddleware = session(sessionConfig);
