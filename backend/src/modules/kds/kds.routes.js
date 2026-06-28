import { Router } from 'express';
import { ROLES } from '../../constants/roles.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { getKdsOrders, markKdsOrderCompleted } from './kds.controller.js';

const router = Router();

router.use(requireAuth, requireRole(ROLES.STAFF));

router.get('/orders', getKdsOrders);
router.patch('/orders/:id/complete', markKdsOrderCompleted);

export default router;

