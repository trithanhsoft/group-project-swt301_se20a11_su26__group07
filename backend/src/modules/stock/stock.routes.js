import { Router } from 'express';
import { ROLES } from '../../constants/roles.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import {
  createBatchImportTransaction,
  createAdjustTransaction,
  createDailyStockCount,
  createImportTransaction,
  getStockTransactions,
  getForecast,
} from './stock.controller.js';

const router = Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.post('/import', createImportTransaction);
router.post('/import/batch', createBatchImportTransaction);
router.post('/adjust', createAdjustTransaction);
router.post('/count/daily', createDailyStockCount);
router.get('/transactions', getStockTransactions);
router.get('/forecast', getForecast);

export default router;
