import { Router } from 'express';
import { createProduct, getProduct, getProducts, updateProduct } from '../controllers/product.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(getProducts));
router.post('/', asyncHandler(createProduct));
router.get('/:id', asyncHandler(getProduct));
router.put('/:id', asyncHandler(updateProduct));

export default router;
