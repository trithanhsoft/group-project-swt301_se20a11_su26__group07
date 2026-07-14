import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { changePassword, login, me, updateMe, forgotPassword, resetPassword } from './auth.controller.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateMe);
router.patch('/change-password', requireAuth, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
