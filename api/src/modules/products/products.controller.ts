import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../shared/errors/httpErrors.js';
import * as service from './products.service.js';
import {
  createProductBodySchema,
  listProductsQuerySchema,
  productIdParamSchema,
  productSlugParamSchema,
  updateProductBodySchema,
} from './products.schemas.js';

export async function listProducts(
  req: Request,
  res: Response,
): Promise<void> {
  const query = listProductsQuerySchema.parse(req.query);

  if (query.includeInactive && !req.admin) {
    throw new UnauthorizedError('includeInactive requires admin privileges');
  }

  const result = await service.list(query, !query.includeInactive);
  res.json({ data: result.items, meta: result.meta });
}

export async function getProductBySlug(
  req: Request,
  res: Response,
): Promise<void> {
  const { slug } = productSlugParamSchema.parse(req.params);
  const query = listProductsQuerySchema.partial().parse(req.query);

  if (query.includeInactive && !req.admin) {
    throw new UnauthorizedError('includeInactive requires admin privileges');
  }

  const data = await service.getBySlug(slug, !query.includeInactive);
  res.json({ data });
}

export async function createProduct(
  req: Request,
  res: Response,
): Promise<void> {
  const body = createProductBodySchema.parse(req.body);
  const data = await service.create(body);
  res.status(201).json({ data });
}

export async function updateProduct(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = productIdParamSchema.parse(req.params);
  const body = updateProductBodySchema.parse(req.body);
  const data = await service.update(id, body);
  res.json({ data });
}

export async function deleteProduct(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = productIdParamSchema.parse(req.params);
  await service.remove(id);
  res.status(204).end();
}