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
  createDiscardTransaction,
} from './stock.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/import', requireRole(ROLES.ADMIN, ROLES.STAFF), createImportTransaction);
router.post('/import/batch', requireRole(ROLES.ADMIN, ROLES.STAFF), createBatchImportTransaction);
router.post('/adjust', requireRole(ROLES.ADMIN, ROLES.STAFF), createAdjustTransaction);
router.post('/count/daily', requireRole(ROLES.ADMIN, ROLES.STAFF), createDailyStockCount);
router.post('/discard', requireRole(ROLES.ADMIN, ROLES.STAFF), createDiscardTransaction);
router.get('/transactions', requireRole(ROLES.ADMIN), getStockTransactions);
router.get('/forecast', requireRole(ROLES.ADMIN), getForecast);

export default router;
