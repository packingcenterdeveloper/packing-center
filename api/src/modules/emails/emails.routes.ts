import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import type { Request, Response } from 'express';
import * as service from './emails.service.js';
import { z } from 'zod';

const orderIdParamSchema = z.object({
  orderId: z.string().uuid(),
});

async function listByOrder(req: Request, res: Response): Promise<void> {
  const { orderId } = orderIdParamSchema.parse(req.params);
  const data = await service.listByOrder(orderId);
  res.json({ data });
}

async function resendByOrder(req: Request, res: Response): Promise<void> {
  const { orderId } = orderIdParamSchema.parse(req.params);
  const data = await service.resendPendingForOrder(orderId);
  res.json({ data });
}

export const emailsRouter: Router = Router();

emailsRouter.get(
  '/orders/:orderId',
  requireAdmin,
  asyncHandler(listByOrder),
);
emailsRouter.post(
  '/orders/:orderId/resend',
  requireAdmin,
  asyncHandler(resendByOrder),
);