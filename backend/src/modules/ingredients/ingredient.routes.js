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

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get('/', getIngredients);
router.post('/', createNewIngredient);
router.get('/:id', getIngredient);
router.patch('/:id', updateExistingIngredient);
router.delete('/:id', deleteExistingIngredient);

export default router;
