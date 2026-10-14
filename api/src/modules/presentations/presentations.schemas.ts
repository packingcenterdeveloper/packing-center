import { z } from 'zod';

export const PRESENTATION_TYPES = [
  'unidad',
  'paquete',
  'bulto',
  'caja',
] as const;

export const presentationTypeSchema = z.enum(PRESENTATION_TYPES);

export const productIdParamSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const presentationIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createPresentationBodySchema = z.object({
  type: presentationTypeSchema,
  sku: z.string().trim().min(1).max(60).optional(),
  priceCents: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().optional(),
});

export const updatePresentationBodySchema = z.object({
  sku: z.string().trim().min(1).max(60).nullable().optional(),
  priceCents: z.coerce.number().int().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreatePresentationBody = z.infer<typeof createPresentationBodySchema>;
export type UpdatePresentationBody = z.infer<typeof updatePresentationBodySchema>;