import { Router } from 'express';
import { ROLES } from '../../constants/roles.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as attendanceController from './attendance.controller.js';

const router = Router();

// Staff check-in / check-out
router.post('/check-in', requireAuth, attendanceController.checkIn);
router.post('/check-out', requireAuth, attendanceController.checkOut);
router.get('/today-status', requireAuth, attendanceController.getTodayStatus);

// Admin-only endpoints
router.get('/qr-token', requireAuth, requireRole(ROLES.ADMIN), attendanceController.getTodayToken);
router.get('/logs', requireAuth, requireRole(ROLES.ADMIN), attendanceController.getLogs);

export default router;
