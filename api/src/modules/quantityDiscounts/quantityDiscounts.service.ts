import type { QuantityDiscount } from '../../db/schema/index.js';
import {
  ConflictError,
  NotFoundError,
} from '../../shared/errors/httpErrors.js';
import * as presentationsRepo from '../presentations/presentations.repository.js';
import * as repo from './quantityDiscounts.repository.js';
import type {
  CreateDiscountBody,
  UpdateDiscountBody,
} from './quantityDiscounts.schemas.js';

export async function listByProduct(
  productId: number,
): Promise<QuantityDiscount[]> {
  return repo.findByProduct(productId);
}

export async function create(
  productId: number,
  input: CreateDiscountBody,
): Promise<QuantityDiscount> {
  const presentation = await presentationsRepo.findById(input.presentationId);
  if (!presentation) {
    throw new NotFoundError(
      `Presentation ${input.presentationId} not found`,
    );
  }

  if (presentation.productId !== productId) {
    throw new ConflictError(
      `Presentation ${input.presentationId} does not belong to product ${productId}`,
    );
  }

  const conflict = await repo.findConflict(
    input.presentationId,
    input.minQuantity,
  );
  if (conflict) {
    throw new ConflictError(
      `A rule with min quantity ${input.minQuantity} already exists for this presentation`,
    );
  }

  return repo.create({
    productId,
    presentationId: input.presentationId,
    minQuantity: input.minQuantity,
    percent: input.percent,
    isActive: input.isActive,
  });
}

export async function update(
  id: number,
  input: UpdateDiscountBody,
): Promise<QuantityDiscount> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError(`Discount rule ${id} not found`);

  if (input.minQuantity !== undefined) {
    const conflict = await repo.findConflict(
      existing.presentationId,
      input.minQuantity,
      id,
    );
    if (conflict) {
      throw new ConflictError(
        `A rule with min quantity ${input.minQuantity} already exists for this presentation`,
      );
    }
  }

  const patch: Partial<QuantityDiscount> = {};
  if (input.minQuantity !== undefined) patch.minQuantity = input.minQuantity;
  if (input.percent !== undefined) patch.percent = input.percent;
  if (input.isActive !== undefined) patch.isActive = input.isActive;

  const updated = await repo.update(id, patch);
  if (!updated) throw new NotFoundError(`Discount rule ${id} not found`);
  return updated;
}

export async function remove(id: number): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError(`Discount rule ${id} not found`);
  await repo.remove(id);
}