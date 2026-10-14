import type { Request, Response } from 'express';
import * as service from './settings.service.js';
import { updateSettingsBodySchema } from './settings.schemas.js';

export async function listSettings(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await service.getAll();
  res.json({ data });
}

export async function updateSettings(
  req: Request,
  res: Response,
): Promise<void> {
  const body = updateSettingsBodySchema.parse(req.body);
  const data = await service.update(body);
  res.json({ data });
}