import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import * as controller from './admin.controller.js';

export const adminRouter: Router = Router();

adminRouter.get(
  '/dashboard',
  requireAdmin,
  asyncHandler(controller.getDashboard),
);