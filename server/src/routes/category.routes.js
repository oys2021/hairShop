import { Router } from 'express';
import { createCategory, getCategories, getCategory, updateCategory } from '../controllers/category.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/rbac.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(requireAuth);
router.get('/', allowRoles('admin', 'manager'), asyncHandler(getCategories));
router.post('/', allowRoles('admin', 'manager'), asyncHandler(createCategory));
router.get('/:id', allowRoles('admin', 'manager'), asyncHandler(getCategory));
router.put('/:id', allowRoles('admin', 'manager'), asyncHandler(updateCategory));

export default router;
