import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import {
  getOpenSession,
  postOpenSession,
  postCloseSession,
  getSessionsHistory,
  postMidShiftCount,
  getSingleSessionReport,
} from './pos_session.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/active', getOpenSession);
router.post('/open', postOpenSession);
router.post('/close', postCloseSession);
router.post('/mid-shift-count', postMidShiftCount);
router.get('/history', getSessionsHistory);
router.get('/:id/report', getSingleSessionReport);

export default router;
