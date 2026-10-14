import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { optionalAdmin, requireAdmin } from '../../middlewares/auth.js';
import * as controller from './coupons.controller.js';

export const couponsRouter: Router = Router();

// --- Validación pública (usada por el front del carrito) ---
couponsRouter.get('/validate', asyncHandler(controller.validateCoupon));

// --- Admin ---
couponsRouter.get(
  '/',
  optionalAdmin,
  asyncHandler(controller.listCoupons),
);
couponsRouter.get(
  '/:id',
  requireAdmin,
  asyncHandler(controller.getCoupon),
);
couponsRouter.post('/', requireAdmin, asyncHandler(controller.createCoupon));
couponsRouter.patch(
  '/:id',
  requireAdmin,
  asyncHandler(controller.updateCoupon),
);
couponsRouter.delete(
  '/:id',
  requireAdmin,
  asyncHandler(controller.deleteCoupon),
);

couponsRouter.post(
  '/:id/assignments',
  requireAdmin,
  asyncHandler(controller.addAssignment),
);
couponsRouter.delete(
  '/:id/assignments/:assignmentId',
  requireAdmin,
  asyncHandler(controller.deleteAssignment),
);