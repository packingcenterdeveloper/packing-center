import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import * as controller from './cart.controller.js';

export const cartRouter: Router = Router();

cartRouter.post('/quote', asyncHandler(controller.quote));