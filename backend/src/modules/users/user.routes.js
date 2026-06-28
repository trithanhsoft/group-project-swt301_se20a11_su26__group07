import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { createNewUser, getUser, getUsers, resetPassword, updateExistingUser } from './user.controller.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/', getUsers);
router.post('/', createNewUser);
router.get('/:id', getUser);
router.patch('/:id', updateExistingUser);
router.patch('/:id/reset-password', resetPassword);

export default router;
