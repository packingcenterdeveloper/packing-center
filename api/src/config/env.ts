import 'dotenv/config';
import { z } from 'zod';

const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === 'boolean') return value;
    return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
  });

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_URL: z.string().url(),
  WEB_URL: z.string().url(),

  TURSO_DATABASE_URL: z.string().min(1),
  TURSO_AUTH_TOKEN: z.string().min(1),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('12h'),

  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(1),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_PRESET: z.string().default('packingcenter'),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('packingcenter/products'),

  // --- Nuevas variables para Resend ---
  RESEND_API_KEY: z.string().min(1),
  MAIL_TO: z.string().email().optional(),
  MAIL_FROM_NAME: z.string().default('PackingCenter'),
  // ------------------------------------

  MP_ACCESS_TOKEN: z.string().min(1),
  MP_PUBLIC_KEY: z.string().min(1),
  MP_WEBHOOK_SECRET: z.string().min(1),
  MP_BACK_URL_SUCCESS: z.string().url(),
  MP_BACK_URL_FAILURE: z.string().url(),
  MP_BACK_URL_PENDING: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const lines = parsed.error.issues.map(
    (issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`,
  );
  console.error(
    `\n[env] Invalid environment variables:\n${lines.join('\n')}\n`,
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;