import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { createNewOrder, getOrder, getOrders, refundOrder, getVietQRConfig } from './order.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', createNewOrder);
router.get('/', getOrders);
router.get('/vietqr-config', getVietQRConfig);
router.get('/:id', getOrder);
router.post('/:id/refund', refundOrder);

export default router;
