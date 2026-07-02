import { Router } from 'express';
import { createProduct, getProduct, getProducts, updateProduct } from '../controllers/product.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/rbac.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(requireAuth);
router.get('/', allowRoles('admin', 'manager'), asyncHandler(getProducts));
router.post('/', allowRoles('admin', 'manager'), asyncHandler(createProduct));
router.get('/:id', allowRoles('admin', 'manager'), asyncHandler(getProduct));
router.put('/:id', allowRoles('admin', 'manager'), asyncHandler(updateProduct));

export default router;
