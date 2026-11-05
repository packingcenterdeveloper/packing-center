import { randomUUID } from 'node:crypto';
import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { getMailer } from '../../config/mailer.js';
import type { Order, OrderItem } from '../../db/schema/index.js';
import * as ordersRepo from '../orders/orders.repository.js';
import * as settingsService from '../settings/settings.service.js';
import * as repo from './emails.repository.js';
import {
  renderOrderAdminEmail,
  renderOrderClientEmail,
  type RenderedEmail,
} from './emails.templates.js';

interface SendContext {
  order: Order;
  items: OrderItem[];
}

async function sendOne(
  type: 'order_admin' | 'order_client',
  toEmail: string,
  rendered: RenderedEmail,
  orderId: string,
  enabled: boolean,
  fromEmail: string,
  ): Promise<void> {
  const eventId = randomUUID();

  await repo.create({
    id: eventId,
    orderId,
    type,
    toEmail,
    subject: rendered.subject,
    status: enabled ? 'pending' : 'skipped',
  });

  if (!enabled) {
    logger.debug(
      { toEmail, subject: rendered.subject, orderId, type },
      'Email skipped: flag disabled',
      );
    return;
  }

  const resend = getMailer();

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    if (error) {
      // Si Resend devuelve un error controlado (ej: email inválido)
      logger.error({ error, toEmail }, 'Resend returned an error');
      await repo.update(eventId, {
        status: 'failed',
        error: error.message,
      });
      return;
    }

    // Si todo salió bien
    await repo.update(eventId, {
      status: 'sent',
      sentAt: new Date(),
    });

  } catch (err) {
    logger.error({ err, toEmail }, 'Failed to send email');
    await repo.update(eventId, {
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

export async function sendOrderEmails(ctx: SendContext): Promise<void> {
  const [adminEnabled, clientEnabled, adminTo] = await Promise.all([
    settingsService.isMailAdminEnabled(),
    settingsService.isMailClientEnabled(),
    settingsService.getMailRecipient(),
  ]);

  const resend = getMailer();
  const fromEmail = `${env.MAIL_FROM_NAME} <pedidos@packingcenteruy.com>`;

  // 1. Mail al ADMIN (siempre que el flag esté activo y haya destinatario)
  if (adminEnabled && adminTo) {
    const rendered = renderOrderAdminEmail(ctx.order, ctx.items);
    await sendOne('order_admin', adminTo, rendered, ctx.order.id, true, fromEmail);
  }

  // 2. Mail al CLIENTE (solo si el flag está activo y el cliente dio su email)
  if (clientEnabled && ctx.order.customerEmail) {
    const rendered = renderOrderClientEmail(ctx.order, ctx.items);
    await sendOne('order_client', ctx.order.customerEmail, rendered, ctx.order.id, true, fromEmail);
  }
}

export async function listByOrder(orderId: string) {
  return repo.findByOrder(orderId);
}

export interface ResendResult {
  sent: number;
  failed: number;
  skipped: number;
  total: number;
}

export async function resendPendingForOrder(
  orderId: string,
  ): Promise<ResendResult> {
  const order = await ordersRepo.findById(orderId);
  if (!order) return { sent: 0, failed: 0, skipped: 0, total: 0 };

  const items = await ordersRepo.findItems(orderId);
  const events = await repo.findByOrder(orderId);

  const [adminEnabled, clientEnabled] = await Promise.all([
    settingsService.isMailAdminEnabled(),
    settingsService.isMailClientEnabled(),
  ]);

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const event of events) {
    if (event.status === 'sent') continue;

    // Chequeo del flag correspondiente al tipo de mail
    const flagEnabled =
    event.type === 'order_admin' ? adminEnabled : clientEnabled;

    if (!flagEnabled) {
      skipped++;
      continue;
    }

    const rendered =
    event.type === 'order_admin'
    ? renderOrderAdminEmail(order, items)
    : renderOrderClientEmail(order, items);

    const transporter = getTransporter();
    if (!transporter) {
      failed++;
      continue;
    }

    try {
      await transporter.sendMail({
        from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_USER}>`,
        to: event.toEmail,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });
      await repo.update(event.id, {
        status: 'sent',
        sentAt: new Date(),
        error: null,
      });
      sent++;
    } catch (err) {
      await repo.update(event.id, {
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      failed++;
    }
  }

  return { sent, failed, skipped, total: events.length };
}