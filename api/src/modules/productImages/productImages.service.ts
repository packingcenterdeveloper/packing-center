import type { ProductImage } from '../../db/schema/index.js';
import { cloudinary } from '../../config/cloudinary.js';
import {
  ConflictError,
  NotFoundError,
} from '../../shared/errors/httpErrors.js';
import { buildFullUrl, buildThumbUrl } from '../../shared/utils/cloudinaryUrl.js';
import * as productsRepo from '../products/products.repository.js';
import * as repo from './productImages.repository.js';
import type {
  CreateImageBody,
  UpdateImageBody,
} from './productImages.schemas.js';

export interface ImageResponse {
  id: number;
  productId: number;
  url: string;
  urlThumb: string;
  urlFull: string;
  publicId: string;
  alt: string | null;
  sortOrder: number;
}

export function enrich(image: ProductImage): ImageResponse {
  return {
    id: image.id,
    productId: image.productId,
    url: image.url,
    urlThumb: buildThumbUrl(image.publicId, { width: 400, crop: 'fill' }),
    urlFull: buildFullUrl(image.publicId, { width: 1200, crop: 'limit' }),
    publicId: image.publicId,
    alt: image.alt,
    sortOrder: image.sortOrder,
  };
}

export async function listByProduct(
  productId: number,
): Promise<ImageResponse[]> {
  const product = await productsRepo.findById(productId);
  if (!product) throw new NotFoundError(`Product ${productId} not found`);
  const rows = await repo.findByProduct(productId);
  return rows.map(enrich);
}

export async function create(
  productId: number,
  input: CreateImageBody,
): Promise<ImageResponse> {
  const product = await productsRepo.findById(productId);
  if (!product) throw new NotFoundError(`Product ${productId} not found`);

  const conflict = await repo.findPublicIdConflict(input.publicId);
  if (conflict) {
    throw new ConflictError('This image is already linked to a product');
  }

  const sortOrder = await repo.nextSortOrder(productId);
  const created = await repo.create({
    productId,
    url: input.url,
    publicId: input.publicId,
    alt: input.alt,
    sortOrder,
  });
  return enrich(created);
}

export async function update(
  id: number,
  input: UpdateImageBody,
): Promise<ImageResponse> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError(`Image ${id} not found`);

  const patch: Partial<ProductImage> = {};
  if (input.alt !== undefined) patch.alt = input.alt ?? null;
  if (input.sortOrder !== undefined) patch.sortOrder = input.sortOrder;

  const updated = await repo.update(id, patch);
  if (!updated) throw new NotFoundError(`Image ${id} not found`);
  return enrich(updated);
}

export async function remove(id: number): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError(`Image ${id} not found`);

  await repo.remove(id);

  try {
    await cloudinary.uploader.destroy(existing.publicId);
  } catch {
    // No frenamos el borrado del DB si Cloudinary falla.
    // La imagen queda huérfana en Cloudinary pero el admin puede limpiarla después.
  }
}