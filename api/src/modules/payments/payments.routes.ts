import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import * as controller from './payments.controller.js';

export const paymentsRouter: Router = Router();

// Pública: MP llama sin auth, la firma es la autenticación.
paymentsRouter.post('/webhook', asyncHandler(controller.webhook));