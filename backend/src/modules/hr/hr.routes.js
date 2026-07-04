import { Router } from 'express';
import { ROLES } from '../../constants/roles.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import {
  assignNewShift,
  changeShiftStatus,
  createNewAvailability,
  createNewRequest,
  createNewShift,
  deleteAssignedShift,
  deleteExistingAvailability,
  deleteExistingShift,
  getAdminHRCosts,
  getAssignedShifts,
  getAvailabilities,
  getMySalary,
  getRequests,
  getShifts,
  processExistingRequest,
  updateExistingShift,
} from './hr.controller.js';

const router = Router();

// Require authentication for all HR routes
router.use(requireAuth);

// --- GENERAL & STAFF ROUTES ---
router.get('/shifts', getShifts);
router.get('/availability', getAvailabilities);
router.post('/availability', createNewAvailability);
router.delete('/availability/:id', deleteExistingAvailability);
router.get('/my-shifts', getAssignedShifts);
router.get('/my-salary', getMySalary);
router.get('/requests', getRequests);
router.post('/requests', createNewRequest);

// --- ADMIN ONLY ROUTES ---
router.post('/shifts', requireRole(ROLES.ADMIN), createNewShift);
router.patch('/shifts/:id', requireRole(ROLES.ADMIN), updateExistingShift);
router.delete('/shifts/:id', requireRole(ROLES.ADMIN), deleteExistingShift);

router.post('/shifts/assign', requireRole(ROLES.ADMIN), assignNewShift);
router.patch('/shifts/assign/:id/status', requireRole(ROLES.ADMIN), changeShiftStatus);
router.delete('/shifts/assign/:id', requireRole(ROLES.ADMIN), deleteAssignedShift);

router.patch('/requests/:id', requireRole(ROLES.ADMIN), processExistingRequest);
router.get('/admin/reports/costs', requireRole(ROLES.ADMIN), getAdminHRCosts);

export default router;
