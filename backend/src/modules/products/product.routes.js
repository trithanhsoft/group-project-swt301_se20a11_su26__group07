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

router.use(requireAuth);

router.get('/', requireRole(ROLES.ADMIN, ROLES.STAFF), getProducts);
router.get('/:id', requireRole(ROLES.ADMIN, ROLES.STAFF), getProduct);

router.post('/', requireRole(ROLES.ADMIN), createNewProduct);
router.patch('/:id', requireRole(ROLES.ADMIN), updateExistingProduct);
router.delete('/:id', requireRole(ROLES.ADMIN), deleteExistingProduct);

export default router;
