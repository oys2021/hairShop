import { Router } from 'express';
import { uploadImage } from '../controllers/uploads.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/rbac.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/', requireAuth, allowRoles('admin', 'manager'), uploadMiddleware.single('image'), uploadImage);

export default router;
