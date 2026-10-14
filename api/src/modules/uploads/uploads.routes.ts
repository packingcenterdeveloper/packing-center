import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import * as controller from './uploads.controller.js';

export const uploadsRouter: Router = Router();

uploadsRouter.get('/config', requireAdmin, asyncHandler(controller.getConfig));