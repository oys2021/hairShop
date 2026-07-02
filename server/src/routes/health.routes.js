import { Router } from 'express';
import { getHealthCheck } from '../controllers/health.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/', asyncHandler(getHealthCheck));

export default router;
