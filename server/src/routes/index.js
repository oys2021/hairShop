import { Router } from 'express';
import auditLogRoutes from './audit-log.routes.js';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import customerRoutes from './customer.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import healthRoutes from './health.routes.js';
import productRoutes from './product.routes.js';
import saleRoutes from './sale.routes.js';
import userRoutes from './user.routes.js';
import uploadsRoutes from './uploads.routes.js';

const router = Router();

router.use('/audit-logs', auditLogRoutes);
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/users', userRoutes);
router.use('/uploads', uploadsRoutes);

export default router;
