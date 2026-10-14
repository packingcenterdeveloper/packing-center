import type { Request, Response } from 'express';
import * as service from './quantityDiscounts.service.js';
import {
  createDiscountBodySchema,
  discountIdParamSchema,
  productIdParamSchema,
  updateDiscountBodySchema,
} from './quantityDiscounts.schemas.js';

export async function listDiscounts(
  req: Request,
  res: Response,
): Promise<void> {
  const { productId } = productIdParamSchema.parse(req.params);
  const data = await service.listByProduct(productId);
  res.json({ data });
}

export async function createDiscount(
  req: Request,
  res: Response,
): Promise<void> {
  const { productId } = productIdParamSchema.parse(req.params);
  const body = createDiscountBodySchema.parse(req.body);
  const data = await service.create(productId, body);
  res.status(201).json({ data });
}

export async function updateDiscount(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = discountIdParamSchema.parse(req.params);
  const body = updateDiscountBodySchema.parse(req.body);
  const data = await service.update(id, body);
  res.json({ data });
}

export async function deleteDiscount(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = discountIdParamSchema.parse(req.params);
  await service.remove(id);
  res.status(204).end();
}