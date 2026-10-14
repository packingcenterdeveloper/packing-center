import type { Request, Response } from 'express';
import * as service from './auth.service.js';
import { loginBodySchema } from './auth.schemas.js';

export async function login(req: Request, res: Response): Promise<void> {
  const body = loginBodySchema.parse(req.body);
  const result = service.login(body.email, body.password);
  res.json({ data: result });
}

export async function me(req: Request, res: Response): Promise<void> {
  res.json({ data: { email: req.admin?.email ?? null } });
}