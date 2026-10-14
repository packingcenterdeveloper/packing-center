import type { Request, Response } from 'express';
import * as service from './productImages.service.js';
import {
  createImageBodySchema,
  imageIdParamSchema,
  productIdParamSchema,
  updateImageBodySchema,
} from './productImages.schemas.js';

export async function listImages(
  req: Request,
  res: Response,
): Promise<void> {
  const { productId } = productIdParamSchema.parse(req.params);
  const data = await service.listByProduct(productId);
  res.json({ data });
}

export async function createImage(
  req: Request,
  res: Response,
): Promise<void> {
  const { productId } = productIdParamSchema.parse(req.params);
  const body = createImageBodySchema.parse(req.body);
  const data = await service.create(productId, body);
  res.status(201).json({ data });
}

export async function updateImage(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = imageIdParamSchema.parse(req.params);
  const body = updateImageBodySchema.parse(req.body);
  const data = await service.update(id, body);
  res.json({ data });
}

export async function deleteImage(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = imageIdParamSchema.parse(req.params);
  await service.remove(id);
  res.status(204).end();
}