import type { Product } from '../../db/schema/index.js';
import {
  ConflictError,
  NotFoundError,
} from '../../shared/errors/httpErrors.js';
import { slugify } from '../../shared/utils/slug.js';
import {
  buildFullUrl,
  buildThumbUrl,
} from '../../shared/utils/cloudinaryUrl.js';
import * as repo from './products.repository.js';
import type {
  CreateProductBody,
  ListProductsQuery,
  UpdateProductBody,
} from './products.schemas.js';
import type { Presentation } from '../../db/schema/index.js';

export interface ProductImageEnriched {
  id: number;
  url: string;
  urlThumb: string;
  urlFull: string;
  publicId: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductListItem extends Product {
  images: ProductImageEnriched[];
  presentations: Presentation[];
}

export interface ListProductsResult {
  items: ProductListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function enrichImage(image: {
  id: number;
  url: string;
  publicId: string;
  alt: string | null;
  sortOrder: number;
}): ProductImageEnriched {
  return {
    id: image.id,
    url: image.url,
    urlThumb: buildThumbUrl(image.publicId, { width: 400, crop: 'fill' }),
    urlFull: buildFullUrl(image.publicId, { width: 1200, crop: 'limit' }),
    publicId: image.publicId,
    alt: image.alt,
    sortOrder: image.sortOrder,
  };
}

export async function list(
  query: ListProductsQuery,
  onlyActive: boolean,
): Promise<ListProductsResult> {
  const { rows, total } = await repo.findAll({
    onlyActive,
    categorySlug: query.category,
    subcategory: query.subcategory,
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

  return {
    items: rows.map((p) => ({
      ...p,
      images: p.images.map(enrichImage),
    })),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function listSubcategories(
  categorySlug: string,
): Promise<string[]> {
  return repo.findDistinctSubcategories(categorySlug);
}

export async function getBySlug(slug: string, onlyActive: boolean) {
  const found = await repo.findBySlug(slug);
  if (!found || (onlyActive && !found.isActive)) {
    throw new NotFoundError(`Product "${slug}" not found`);
  }
  return {
    ...found,
    images: found.images.map(enrichImage),
  };
}

export async function getById(id: number): Promise<Product> {
  const found = await repo.findById(id);
  if (!found) throw new NotFoundError(`Product ${id} not found`);
  return found;
}

export async function getByIdAdmin(id: number) {
  const found = await repo.findByIdWithRelations(id);
  if (!found) throw new NotFoundError(`Product ${id} not found`);
  return {
    ...found,
    images: found.images.map(enrichImage),
  };
}

export async function create(input: CreateProductBody): Promise<Product> {
  const slug = slugify(input.slug ?? input.name);
  if (!slug) throw new ConflictError('Could not generate a valid slug');

  const exists = await repo.categoryExists(input.categoryId);
  if (!exists) {
    throw new NotFoundError(`Category ${input.categoryId} not found`);
  }

  const conflict = await repo.findSlugConflict(slug);
  if (conflict) throw new ConflictError(`Slug "${slug}" is already in use`);

  return repo.create({
    name: input.name,
    slug,
    categoryId: input.categoryId,
    subcategory: input.subcategory ?? null,
    description: input.description,
    measures: input.measures,
    isActive: input.isActive,
  });
}

export async function update(
  id: number,
  input: UpdateProductBody,
): Promise<Product> {
  await getById(id);

  const patch: Partial<Product> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.measures !== undefined) patch.measures = input.measures;
  if (input.isActive !== undefined) patch.isActive = input.isActive;
  if (input.subcategory !== undefined) {
    patch.subcategory = input.subcategory;
  }

  if (input.categoryId !== undefined) {
    const exists = await repo.categoryExists(input.categoryId);
    if (!exists) {
      throw new NotFoundError(`Category ${input.categoryId} not found`);
    }
    patch.categoryId = input.categoryId;
  }

  if (input.slug !== undefined) {
    const slug = slugify(input.slug);
    if (!slug) throw new ConflictError('Invalid slug');
    const conflict = await repo.findSlugConflict(slug, id);
    if (conflict) throw new ConflictError(`Slug "${slug}" is already in use`);
    patch.slug = slug;
  }

  const updated = await repo.update(id, patch);
  if (!updated) throw new NotFoundError(`Product ${id} not found`);
  return updated;
}

export async function remove(id: number): Promise<void> {
  await getById(id);

  const presentationsCount = await repo.countPresentations(id);
  if (presentationsCount > 0) {
    throw new ConflictError(
      `Cannot delete product: ${presentationsCount} presentation(s) still assigned to it`,
    );
  }

  await repo.remove(id);
}