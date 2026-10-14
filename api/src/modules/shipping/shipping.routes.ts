import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import * as controller from './shipping.controller.js';

export const shippingRouter: Router = Router();

shippingRouter.get('/departments', asyncHandler(controller.listDepartments));