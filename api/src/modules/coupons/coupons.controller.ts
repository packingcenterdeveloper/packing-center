import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../shared/errors/httpErrors.js';
import * as service from './coupons.service.js';
import {
  couponAssignmentParamSchema,
  couponIdParamSchema,
  createAssignmentBodySchema,
  createCouponBodySchema,
  listCouponsQuerySchema,
  updateCouponBodySchema,
  validateCouponQuerySchema,
} from './coupons.schemas.js';

export async function listCoupons(
  req: Request,
  res: Response,
): Promise<void> {
  const { includeInactive } = listCouponsQuerySchema.parse(req.query);
  if (includeInactive && !req.admin) {
    throw new UnauthorizedError('includeInactive requires admin privileges');
  }
  const data = await service.list(!includeInactive);
  res.json({ data });
}

export async function getCoupon(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = couponIdParamSchema.parse(req.params);
  const data = await service.getById(id);
  res.json({ data });
}

export async function createCoupon(
  req: Request,
  res: Response,
): Promise<void> {
  const body = createCouponBodySchema.parse(req.body);
  const data = await service.create(body);
  res.status(201).json({ data });
}

export async function updateCoupon(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = couponIdParamSchema.parse(req.params);
  const body = updateCouponBodySchema.parse(req.body);
  const data = await service.update(id, body);
  res.json({ data });
}

export async function deleteCoupon(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = couponIdParamSchema.parse(req.params);
  await service.remove(id);
  res.status(204).end();
}

export async function addAssignment(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = couponIdParamSchema.parse(req.params);
  const body = createAssignmentBodySchema.parse(req.body);
  const data = await service.addAssignment(id, body);
  res.status(201).json({ data });
}

export async function deleteAssignment(
  req: Request,
  res: Response,
): Promise<void> {
  const { id, assignmentId } = couponAssignmentParamSchema.parse(req.params);
  await service.removeAssignment(id, assignmentId);
  res.status(204).end();
}

export async function validateCoupon(
  req: Request,
  res: Response,
): Promise<void> {
  const { code, presentationId } = validateCouponQuerySchema.parse(req.query);
  const data = await service.validateForPresentation(code, presentationId);
  res.json({ data });
}