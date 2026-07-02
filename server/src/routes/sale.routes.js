import { Router } from 'express';
import { createSale, getSale, getSales, updateSale } from '../controllers/sale.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(getSales));
router.post('/', asyncHandler(createSale));
router.get('/:id', asyncHandler(getSale));
router.put('/:id', asyncHandler(updateSale));

export default router;
