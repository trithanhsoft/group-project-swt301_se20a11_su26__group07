import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { changePassword, login, me, updateMe } from './auth.controller.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);
router.patch('/change-password', requireAuth, changePassword);

export default router;
