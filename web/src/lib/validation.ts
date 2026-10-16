import { z } from 'zod';
import { SHIPPING_OPTIONS } from './shipping';

const shippingValues = SHIPPING_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, 'Ingresá tu nombre')
    .max(120, 'Máximo 120 caracteres'),
  customerPhone: z
    .string()
    .trim()
    .min(8, 'Teléfono inválido')
    .max(20, 'Máximo 20 caracteres')
    .regex(
      /^[0-9+\s()-]+$/,
      'Solo números, espacios, +, paréntesis y guiones',
    ),
  customerEmail: z
    .string()
    .trim()
    .email('Email inválido')
    .max(200, 'Máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  customerAddress: z
    .string()
    .trim()
    .min(3, 'Ingresá tu dirección')
    .max(200, 'Máximo 200 caracteres'),
  customerCity: z
    .string()
    .trim()
    .min(2, 'Ingresá tu ciudad')
    .max(80, 'Máximo 80 caracteres'),
  customerNotes: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  shippingDepartment: z.enum(shippingValues, {
    message: 'Elegí una localidad',
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;