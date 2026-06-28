import { Router } from 'express';
import { ROLES } from '../../constants/roles.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { createNewOrder, getOrder, getOrders } from './order.controller.js';

const router = Router();

router.use(requireAuth, requireRole(ROLES.STAFF));

router.post('/', createNewOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);

export default router;
