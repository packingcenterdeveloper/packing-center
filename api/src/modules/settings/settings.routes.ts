import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import * as controller from './settings.controller.js';

export const settingsRouter: Router = Router();

settingsRouter.get('/', requireAdmin, asyncHandler(controller.listSettings));
settingsRouter.patch(
  '/',
  requireAdmin,
  asyncHandler(controller.updateSettings),
);