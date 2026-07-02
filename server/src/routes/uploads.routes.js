import { Router } from 'express';
import { uploadImage } from '../controllers/uploads.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/', requireAuth, uploadMiddleware.single('image'), uploadImage);

export default router;
