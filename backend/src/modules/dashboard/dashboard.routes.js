import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { summary } from './dashboard.controller.js';

const router = Router();

router.get('/summary', requireAuth, summary);

export default router;
