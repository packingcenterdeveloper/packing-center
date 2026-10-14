import type { Request, Response } from 'express';
import * as service from './admin.service.js';

export async function getDashboard(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await service.getDashboard();
  res.json({ data });
}