import type { Coupon } from '../../db/schema/index.js';
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../shared/errors/httpErrors.js';
import * as presentationsRepo from '../presentations/presentations.repository.js';
import * as repo from './coupons.repository.js';
import type {
  CreateAssignmentBody,
  CreateCouponBody,
  UpdateCouponBody,
} from './coupons.schemas.js';

export async function list(
  onlyActive: boolean,
): Promise<repo.CouponWithAssignments[]> {
  return repo.findAll(onlyActive);
}

export async function getById(
  id: number,
): Promise<repo.CouponWithAssignments> {
  const found = await repo.findById(id);
  if (!found) throw new NotFoundError(`Coupon ${id} not found`);
  return found;
}

export async function create(input: CreateCouponBody): Promise<Coupon> {
  const existing = await repo.findByCode(input.code);
  if (existing) {
    throw new ConflictError(`Coupon code "${input.code}" already exists`);
  }

  if (input.validFrom && input.validUntil && input.validFrom > input.validUntil) {
    throw new UnprocessableEntityError(
      'validFrom must be earlier than validUntil',
    );
  }

  return repo.create({
    code: input.code,
    description: input.description,
    maxUses: input.maxUses ?? null,
    validFrom: input.validFrom ?? null,
    validUntil: input.validUntil ?? null,
    isActive: input.isActive,
  });
}

export async function update(
  id: number,
  input: UpdateCouponBody,
): Promise<Coupon> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError(`Coupon ${id} not found`);

  const patch: Partial<Coupon> = {};

  if (input.description !== undefined) patch.description = input.description;
  if (input.maxUses !== undefined) patch.maxUses = input.maxUses;
  if (input.isActive !== undefined) patch.isActive = input.isActive;

  if (input.validFrom !== undefined) patch.validFrom = input.validFrom;
  if (input.validUntil !== undefined) patch.validUntil = input.validUntil;

  const nextFrom =
    input.validFrom !== undefined ? input.validFrom : existing.validFrom;
  const nextUntil =
    input.validUntil !== undefined ? input.validUntil : existing.validUntil;
  if (nextFrom && nextUntil && nextFrom > nextUntil) {
    throw new UnprocessableEntityError(
      'validFrom must be earlier than validUntil',
    );
  }

  if (input.maxUses !== undefined && input.maxUses !== null) {
    if (input.maxUses < existing.usedCount) {
      throw new UnprocessableEntityError(
        `maxUses cannot be lower than current usedCount (${existing.usedCount})`,
      );
    }
  }

  const updated = await repo.update(id, patch);
  if (!updated) throw new NotFoundError(`Coupon ${id} not found`);
  return updated;
}

export async function remove(id: number): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError(`Coupon ${id} not found`);
  await repo.remove(id);
}

export async function addAssignment(
  couponId: number,
  input: CreateAssignmentBody,
) {
  const coupon = await repo.findById(couponId);
  if (!coupon) throw new NotFoundError(`Coupon ${couponId} not found`);

  const presentation = await presentationsRepo.findById(input.presentationId);
  if (!presentation) {
    throw new NotFoundError(`Presentation ${input.presentationId} not found`);
  }
  if (presentation.productId !== input.productId) {
    throw new ConflictError(
      `Presentation ${input.presentationId} does not belong to product ${input.productId}`,
    );
  }

  const conflict = await repo.findAssignmentConflict(
    couponId,
    input.presentationId,
  );
  if (conflict) {
    throw new ConflictError(
      'This coupon is already assigned to that presentation',
    );
  }

  return repo.createAssignment({
    couponId,
    productId: input.productId,
    presentationId: input.presentationId,
    percent: input.percent,
    isActive: input.isActive,
  });
}

export async function removeAssignment(
  couponId: number,
  assignmentId: number,
): Promise<void> {
  const assignment = await repo.findAssignmentById(assignmentId);
  if (!assignment || assignment.couponId !== couponId) {
    throw new NotFoundError(
      `Assignment ${assignmentId} not found for coupon ${couponId}`,
    );
  }
  await repo.removeAssignment(assignmentId);
}

export interface ValidateCouponResult {
  valid: boolean;
  code: string;
  percent?: number;
  reason?: string;
}

export async function validateForPresentation(
  code: string,
  presentationId: number,
): Promise<ValidateCouponResult> {
  const coupon = await repo.findByCode(code);
  if (!coupon) {
    return { valid: false, code, reason: 'Coupon not found' };
  }
  if (!coupon.isActive) {
    return { valid: false, code, reason: 'Coupon is not active' };
  }

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) {
    return { valid: false, code, reason: 'Coupon is not yet valid' };
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return { valid: false, code, reason: 'Coupon has expired' };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, code, reason: 'Coupon has reached its usage limit' };
  }

  const assignment = await repo.findAssignmentForPresentation(
    coupon.id,
    presentationId,
  );
  if (!assignment) {
    return {
      valid: false,
      code,
      reason: 'Coupon does not apply to this presentation',
    };
  }

  return { valid: true, code, percent: assignment.percent };
}