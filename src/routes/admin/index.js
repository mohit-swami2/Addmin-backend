import { Router } from 'express';
import adminRoutes from '../../modules/admin/admin.routes.js';
import userRoutes from '../../modules/user/user.routes.js';
import productRoutes from '../../modules/product/product.routes.js';
import dashboardRoutes from '../../modules/dashboard/dashboard.routes.js';
import globalSettingRoutes from '../../modules/globalSetting/globalSetting.routes.js';
import searchRoutes from '../../modules/search/search.routes.js';

const router = Router();

router.use('/auth', adminRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', globalSettingRoutes);
router.use('/search', searchRoutes);

export default router;
