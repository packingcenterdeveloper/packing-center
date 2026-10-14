import type { Request, Response } from 'express';
import * as service from './categories.service.js';
import { UnauthorizedError } from '../../shared/errors/httpErrors.js';
import {
  categoryIdParamSchema,
  categorySlugParamSchema,
  createCategoryBodySchema,
  listCategoriesQuerySchema,
  updateCategoryBodySchema,
} from './categories.schemas.js';

export async function listCategories(
  req: Request,
  res: Response,
  ): Promise<void> {
  const { includeInactive } = listCategoriesQuerySchema.parse(req.query);
  if (includeInactive && !req.admin) {
    throw new UnauthorizedError(
      'includeInactive requires admin privileges',
      );
  }
  const data = await service.list(!includeInactive);
  res.json({ data });
}

export async function getCategoryBySlug(
  req: Request,
  res: Response,
  ): Promise<void> {
  const { slug } = categorySlugParamSchema.parse(req.params);
  const data = await service.getBySlug(slug);
  res.json({ data });
}

export async function createCategory(
  req: Request,
  res: Response,
  ): Promise<void> {
  const body = createCategoryBodySchema.parse(req.body);
  const data = await service.create(body);
  res.status(201).json({ data });
}

export async function updateCategory(
  req: Request,
  res: Response,
  ): Promise<void> {
  const { id } = categoryIdParamSchema.parse(req.params);
  const body = updateCategoryBodySchema.parse(req.body);
  const data = await service.update(id, body);
  res.json({ data });
}

export async function deleteCategory(
  req: Request,
  res: Response,
  ): Promise<void> {
  const { id } = categoryIdParamSchema.parse(req.params);
  await service.remove(id);
  res.status(204).end();
}