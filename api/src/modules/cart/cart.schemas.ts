import { z } from 'zod';

export const quoteItemSchema = z.object({
  presentationId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().max(10000),
});

export const quoteBodySchema = z.object({
  items: z.array(quoteItemSchema).min(1).max(100),
  coupons: z
    .array(z.string().trim().min(1).max(60).transform((v) => v.toUpperCase()))
    .max(20)
    .default([]),
  shippingDepartment: z.string().trim().min(1).max(80).optional(),
});

export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
export type QuoteBody = z.infer<typeof quoteBodySchema>;