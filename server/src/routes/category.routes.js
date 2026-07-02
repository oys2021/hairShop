import { Router } from 'express';
import { createCategory, getCategories, getCategory, updateCategory } from '../controllers/category.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(getCategories));
router.post('/', asyncHandler(createCategory));
router.get('/:id', asyncHandler(getCategory));
router.put('/:id', asyncHandler(updateCategory));

export default router;
