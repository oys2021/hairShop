import { Router } from 'express';
import { createCustomer, getCustomer, getCustomers, updateCustomer } from '../controllers/customer.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(getCustomers));
router.post('/', asyncHandler(createCustomer));
router.get('/:id', asyncHandler(getCustomer));
router.put('/:id', asyncHandler(updateCustomer));

export default router;
