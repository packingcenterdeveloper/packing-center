import { z } from 'zod';

export const couponIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const couponAssignmentParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  assignmentId: z.coerce.number().int().positive(),
});

export const listCouponsQuerySchema = z.object({
  includeInactive: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export const createCouponBodySchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .transform((v) => v.toUpperCase()),
  description: z.string().trim().max(500).optional(),
  maxUses: z.coerce.number().int().positive().nullable().optional(),
  validFrom: z.coerce.date().nullable().optional(),
  validUntil: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateCouponBodySchema = z.object({
  description: z.string().trim().max(500).nullable().optional(),
  maxUses: z.coerce.number().int().positive().nullable().optional(),
  validFrom: z.coerce.date().nullable().optional(),
  validUntil: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createAssignmentBodySchema = z.object({
  productId: z.coerce.number().int().positive(),
  presentationId: z.coerce.number().int().positive(),
  percent: z.coerce.number().int().min(1).max(100),
  isActive: z.boolean().optional(),
});

export const validateCouponQuerySchema = z.object({
  code: z.string().trim().min(1).max(60).transform((v) => v.toUpperCase()),
  presentationId: z.coerce.number().int().positive(),
});

export type CreateCouponBody = z.infer<typeof createCouponBodySchema>;
export type UpdateCouponBody = z.infer<typeof updateCouponBodySchema>;
export type CreateAssignmentBody = z.infer<typeof createAssignmentBodySchema>;