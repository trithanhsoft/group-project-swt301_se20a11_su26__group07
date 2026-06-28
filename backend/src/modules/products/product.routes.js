import { Router } from 'express';
import { ROLES } from '../../constants/roles.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import {
  createNewProduct,
  deleteExistingProduct,
  getPosAvailableProducts,
  getProduct,
  getProducts,
  updateExistingProduct,
} from './product.controller.js';

const router = Router();

router.get('/pos/available', requireAuth, requireRole(ROLES.ADMIN, ROLES.STAFF), getPosAvailableProducts);

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get('/', getProducts);
router.post('/', createNewProduct);
router.get('/:id', getProduct);
router.patch('/:id', updateExistingProduct);
router.delete('/:id', deleteExistingProduct);

export default router;
