import type { Presentation } from '../../db/schema/index.js';
import {
  ConflictError,
  NotFoundError,
} from '../../shared/errors/httpErrors.js';
import * as productsRepo from '../products/products.repository.js';
import * as repo from './presentations.repository.js';
import type {
  CreatePresentationBody,
  UpdatePresentationBody,
} from './presentations.schemas.js';

export async function listByProduct(
  productId: number,
): Promise<Presentation[]> {
  const product = await productsRepo.findById(productId);
  if (!product) throw new NotFoundError(`Product ${productId} not found`);
  return repo.findByProduct(productId);
}

export async function create(
  productId: number,
  input: CreatePresentationBody,
): Promise<Presentation> {
  const product = await productsRepo.findById(productId);
  if (!product) throw new NotFoundError(`Product ${productId} not found`);

  const conflict = await repo.findConflictByType(productId, input.type);
  if (conflict) {
    throw new ConflictError(
      `This product already has a "${input.type}" presentation`,
    );
  }

  if (input.sku) {
    const skuConflict = await repo.findSkuConflict(input.sku);
    if (skuConflict) {
      throw new ConflictError(`SKU "${input.sku}" is already in use`);
    }
  }

  return repo.create({
    productId,
    type: input.type,
    sku: input.sku,
    priceCents: input.priceCents,
    stock: input.stock,
    isActive: input.isActive,
  });
}

export async function update(
  id: number,
  input: UpdatePresentationBody,
): Promise<Presentation> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError(`Presentation ${id} not found`);

  const patch: Partial<Presentation> = {};
  if (input.priceCents !== undefined) patch.priceCents = input.priceCents;
  if (input.stock !== undefined) patch.stock = input.stock;
  if (input.isActive !== undefined) patch.isActive = input.isActive;

  if (input.sku !== undefined) {
    if (input.sku === null || input.sku === '') {
      patch.sku = null;
    } else {
      const conflict = await repo.findSkuConflict(input.sku, id);
      if (conflict) {
        throw new ConflictError(`SKU "${input.sku}" is already in use`);
      }
      patch.sku = input.sku;
    }
  }

  const updated = await repo.update(id, patch);
  if (!updated) throw new NotFoundError(`Presentation ${id} not found`);
  return updated;
}

export async function remove(id: number): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError(`Presentation ${id} not found`);

  if (existing.stockReserved > 0) {
    throw new ConflictError(
      `Cannot delete: ${existing.stockReserved} unit(s) reserved in pending orders`,
    );
  }

  await repo.remove(id);
}