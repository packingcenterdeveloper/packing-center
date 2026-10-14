import { z } from 'zod';
import { ORDER_STATUSES } from '../../db/schema/index.js';

export const orderIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const orderPhoneParamSchema = z.object({
  phone: z.string().trim().min(5).max(30),
});

export const checkoutItemSchema = z.object({
  presentationId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().max(10000),
});

export const checkoutBodySchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(5).max(30),
    email: z.string().trim().email().max(200).optional(),
    address: z.string().trim().max(300).optional(),
    city: z.string().trim().max(80).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
  items: z.array(checkoutItemSchema).min(1).max(100),
  coupons: z
    .array(z.string().trim().min(1).max(60).transform((v) => v.toUpperCase()))
    .max(20)
    .default([]),
  shippingDepartment: z.string().trim().min(1).max(80).optional(),
  paymentMethod: z.enum(['mercadopago', 'cash', 'transfer']),
});

export const verifyPhoneQuerySchema = z.object({
  phone: z.string().trim().min(5).max(30),
});

export const adminListOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  unseen: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  search: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateStatusBodySchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(500).optional(),
});

export type CheckoutBody = z.infer<typeof checkoutBodySchema>;
export type AdminListOrdersQuery = z.infer<typeof adminListOrdersQuerySchema>;
export type UpdateStatusBody = z.infer<typeof updateStatusBodySchema>;