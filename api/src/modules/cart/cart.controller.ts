import type { Request, Response } from 'express';
import * as service from './cart.service.js';
import { quoteBodySchema } from './cart.schemas.js';

export async function quote(req: Request, res: Response): Promise<void> {
  const body = quoteBodySchema.parse(req.body);
  const data = await service.quote(body);
  res.json({ data });
}