import type { Request, Response } from 'express';
import * as service from './presentations.service.js';
import {
  createPresentationBodySchema,
  presentationIdParamSchema,
  productIdParamSchema,
  updatePresentationBodySchema,
} from './presentations.schemas.js';

export async function listPresentations(
  req: Request,
  res: Response,
): Promise<void> {
  const { productId } = productIdParamSchema.parse(req.params);
  const data = await service.listByProduct(productId);
  res.json({ data });
}

export async function createPresentation(
  req: Request,
  res: Response,
): Promise<void> {
  const { productId } = productIdParamSchema.parse(req.params);
  const body = createPresentationBodySchema.parse(req.body);
  const data = await service.create(productId, body);
  res.status(201).json({ data });
}

export async function updatePresentation(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = presentationIdParamSchema.parse(req.params);
  const body = updatePresentationBodySchema.parse(req.body);
  const data = await service.update(id, body);
  res.json({ data });
}

export async function deletePresentation(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = presentationIdParamSchema.parse(req.params);
  await service.remove(id);
  res.status(204).end();
}