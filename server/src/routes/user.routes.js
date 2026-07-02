import { Router } from 'express';
import { createUser, deleteUser, getUser, getUsers, updateUser } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/rbac.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(requireAuth);
router.get('/', allowRoles('admin', 'manager'), asyncHandler(getUsers));
router.post('/', allowRoles('admin', 'manager'), asyncHandler(createUser));
router.get('/:id', allowRoles('admin', 'manager'), asyncHandler(getUser));
router.put('/:id', allowRoles('admin', 'manager'), asyncHandler(updateUser));
router.delete('/:id', allowRoles('admin', 'manager'), asyncHandler(deleteUser));

export default router;
