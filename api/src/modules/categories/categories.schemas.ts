import { z } from 'zod';

export const categorySlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(140),
});

export const categoryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listCategoriesQuerySchema = z.object({
  includeInactive: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export const createCategoryBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(140).optional(),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.string().url().max(500).optional(),
  imagePublicId: z.string().trim().max(200).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateCategoryBodySchema = createCategoryBodySchema.partial();

export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;