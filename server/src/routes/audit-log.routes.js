import { Router } from 'express';
import { getAuditLog, getAuditLogs } from '../controllers/audit-log.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, getAuditLogs);
router.get('/:id', requireAuth, getAuditLog);

export default router;
