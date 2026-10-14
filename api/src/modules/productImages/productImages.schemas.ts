import { z } from 'zod';

export const productIdParamSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const imageIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createImageBodySchema = z.object({
  url: z.string().url().max(500),
  publicId: z.string().trim().min(1).max(300),
  alt: z.string().trim().max(200).optional(),
});

export const updateImageBodySchema = z.object({
  alt: z.string().trim().max(200).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export type CreateImageBody = z.infer<typeof createImageBodySchema>;
export type UpdateImageBody = z.infer<typeof updateImageBodySchema>;