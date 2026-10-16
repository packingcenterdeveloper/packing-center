import { z } from 'zod';

export const productSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(140),
});

export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listProductsQuerySchema = z.object({
  category: z.string().trim().min(1).max(140).optional(),
  subcategory: z.string().trim().min(1).max(80).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  includeInactive: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createProductBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(140).optional(),
  categoryId: z.coerce.number().int().positive(),
  subcategory: z.string().trim().max(80).nullable().optional(),
  description: z.string().trim().max(2000).optional(),
  measures: z.string().trim().max(300).optional(),
  isActive: z.boolean().optional(),
});

export const updateProductBodySchema = createProductBodySchema
  .omit({ categoryId: true })
  .extend({
    categoryId: z.coerce.number().int().positive().optional(),
  })
  .partial();

export type CreateProductBody = z.infer<typeof createProductBodySchema>;
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;