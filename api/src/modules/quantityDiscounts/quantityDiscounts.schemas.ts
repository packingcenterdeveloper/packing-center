import { z } from 'zod';

export const productIdParamSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const discountIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createDiscountBodySchema = z.object({
  presentationId: z.coerce.number().int().positive(),
  minQuantity: z.coerce.number().int().positive(),
  percent: z.coerce.number().int().min(1).max(99),
  isActive: z.boolean().optional(),
});

export const updateDiscountBodySchema = z.object({
  minQuantity: z.coerce.number().int().positive().optional(),
  percent: z.coerce.number().int().min(1).max(99).optional(),
  isActive: z.boolean().optional(),
});

export type CreateDiscountBody = z.infer<typeof createDiscountBodySchema>;
export type UpdateDiscountBody = z.infer<typeof updateDiscountBodySchema>;