import { Router } from 'express';
import { ROLES } from '../../constants/roles.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import {
  createNewIngredient,
  deleteExistingIngredient,
  getIngredient,
  getIngredients,
  updateExistingIngredient,
} from './ingredient.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole(ROLES.ADMIN, ROLES.STAFF), getIngredients);
router.get('/:id', requireRole(ROLES.ADMIN, ROLES.STAFF), getIngredient);

router.post('/', requireRole(ROLES.ADMIN), createNewIngredient);
router.patch('/:id', requireRole(ROLES.ADMIN), updateExistingIngredient);
router.delete('/:id', requireRole(ROLES.ADMIN), deleteExistingIngredient);

export default router;
