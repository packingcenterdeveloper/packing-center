import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import * as controller from './products.controller.js';

export const adminProductsRouter: Router = Router();

adminProductsRouter.get(
  '/:id',
  requireAdmin,
  asyncHandler(controller.adminGetProduct),
);