import { Router } from 'express';
import { ROLES } from '../../constants/roles.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import {
  getBestSellingProductsReport,
  getLowStockIngredientsReport,
  getRevenueReport,
} from './report.controller.js';

const router = Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get('/revenue', getRevenueReport);
router.get('/best-selling-products', getBestSellingProductsReport);
router.get('/low-stock-ingredients', getLowStockIngredientsReport);

export default router;
