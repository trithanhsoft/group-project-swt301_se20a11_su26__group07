import { Router } from 'express';
import { ROLES } from '../../constants/roles.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import {
  createNewRecipe,
  deleteExistingRecipe,
  getRecipe,
  getRecipeForProduct,
  getRecipes,
  updateExistingRecipe,
} from './recipe.controller.js';

const router = Router();

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get('/', getRecipes);
router.post('/', createNewRecipe);
router.get('/product/:productId', getRecipeForProduct);
router.get('/:id', getRecipe);
router.patch('/:id', updateExistingRecipe);
router.delete('/:id', deleteExistingRecipe);

export default router;
