// api/src/config/mailer.ts
import { Resend } from 'resend';
import { env } from './env.js';

// Reemplazamos Nodemailer por Resend
const resend = new Resend(env.RESEND_API_KEY);

export function getMailer() {
  return resend;
}