import { Router } from 'express';
import {
  forgotPassword,
  getMe,
  login,
  logout,
  resetUserPassword,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetUserPassword));
router.get('/me', requireAuth, asyncHandler(getMe));
router.post('/logout', requireAuth, asyncHandler(logout));

export default router;
