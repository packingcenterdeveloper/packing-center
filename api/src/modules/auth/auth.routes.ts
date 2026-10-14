import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import * as controller from './auth.controller.js';

export const authRouter: Router = Router();

authRouter.post('/login', asyncHandler(controller.login));
authRouter.get('/me', requireAdmin, asyncHandler(controller.me));