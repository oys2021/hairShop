import { Router } from 'express';
import { createCustomer, getCustomer, getCustomers, updateCustomer } from '../controllers/customer.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/rbac.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(requireAuth);
router.get('/', allowRoles('admin', 'manager'), asyncHandler(getCustomers));
router.post('/', allowRoles('admin', 'manager'), asyncHandler(createCustomer));
router.get('/:id', allowRoles('admin', 'manager'), asyncHandler(getCustomer));
router.put('/:id', allowRoles('admin', 'manager'), asyncHandler(updateCustomer));

export default router;
