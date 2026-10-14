import { z } from 'zod';

export const updateSettingsBodySchema = z
  .object({
    MAIL_ADMIN_ENABLED: z.boolean().optional(),
    MAIL_CLIENT_ENABLED: z.boolean().optional(),
    MAIL_TO: z.string().trim().email().max(200).or(z.literal('')).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one setting must be provided',
  });

export type UpdateSettingsBody = z.infer<typeof updateSettingsBodySchema>;