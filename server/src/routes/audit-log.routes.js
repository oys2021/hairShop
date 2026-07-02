import { Router } from 'express';
import { getAuditLog, getAuditLogs } from '../controllers/audit-log.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/rbac.middleware.js';

const router = Router();

router.get('/', requireAuth, allowRoles('admin'), getAuditLogs);
router.get('/:id', requireAuth, allowRoles('admin'), getAuditLog);

export default router;
