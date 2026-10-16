import type { Category } from '../../db/schema/index.js';
import {
  ConflictError,
  NotFoundError,
} from '../../shared/errors/httpErrors.js';
import { slugify } from '../../shared/utils/slug.js';
import * as repo from './categories.repository.js';
import type {
  CreateCategoryBody,
  UpdateCategoryBody,
} from './categories.schemas.js';
import * as productsService from '../products/products.service.js';

export async function list(onlyActive: boolean): Promise<Category[]> {
  return repo.findAll(onlyActive);
}

export async function getBySlug(slug: string): Promise<Category> {
  const found = await repo.findBySlug(slug);
  if (!found) throw new NotFoundError(`Category "${slug}" not found`);
  return found;
}

export async function getById(id: number): Promise<Category> {
  const found = await repo.findById(id);
  if (!found) throw new NotFoundError(`Category ${id} not found`);
  return found;
}

export async function create(input: CreateCategoryBody): Promise<Category> {
  const slug = slugify(input.slug ?? input.name);
  if (!slug) throw new ConflictError('Could not generate a valid slug');

  const conflict = await repo.findSlugConflict(slug);
  if (conflict) throw new ConflictError(`Slug "${slug}" is already in use`);

  return repo.create({
    name: input.name,
    slug,
    description: input.description,
    imageUrl: input.imageUrl,
    imagePublicId: input.imagePublicId,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  });
}

export async function update(
  id: number,
  input: UpdateCategoryBody,
  ): Promise<Category> {
  await getById(id);

  const patch: Partial<Category> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.imageUrl !== undefined) patch.imageUrl = input.imageUrl;
  if (input.imagePublicId !== undefined)
    patch.imagePublicId = input.imagePublicId;
  if (input.sortOrder !== undefined) patch.sortOrder = input.sortOrder;
  if (input.isActive !== undefined) patch.isActive = input.isActive;

  if (input.slug !== undefined) {
    const slug = slugify(input.slug);
    if (!slug) throw new ConflictError('Invalid slug');
    const conflict = await repo.findSlugConflict(slug, id);
    if (conflict) throw new ConflictError(`Slug "${slug}" is already in use`);
    patch.slug = slug;
  }

  const updated = await repo.update(id, patch);
  if (!updated) throw new NotFoundError(`Category ${id} not found`);
  return updated;
}

export async function remove(id: number): Promise<void> {
  await getById(id);
  const productCount = await repo.countProducts(id);
  if (productCount > 0) {
    throw new ConflictError(
  `Cannot delete category: ${productCount} product(s) still assigned to it`,
  );
  }
  await repo.remove(id);
}

export async function listSubcategories(
  slug: string,
  ): Promise<string[]> {
  // Valida que la categoría exista
  await getBySlug(slug);
  return productsService.listSubcategories(slug);
}