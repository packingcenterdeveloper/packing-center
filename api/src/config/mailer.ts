import nodemailer, { type Transporter } from 'nodemailer';
import { env } from './env.js';

let transporter: Transporter | null = null;

export function getTransporter(): Transporter | null {
  console.log(`[DEBUG] getTransporter - MAIL_USER: ${!!env.MAIL_USER}, MAIL_PASS: ${!!env.MAIL_PASS}`);
  if (!env.MAIL_USER || !env.MAIL_PASS) {
    console.error('[DEBUG] Faltan credenciales MAIL_USER o MAIL_PASS');
    return null;
  }
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_SECURE,
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASS,
    },
    logger: true,
    debug: true,
  });

  return transporter;
}