import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { getTransporter } from '../../config/mailer.js';
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

  const transporter = getTransporter();
  if (!transporter) {
    await repo.update(eventId, {
      status: 'failed',
      error: 'No transporter configured (missing MAIL_USER/MAIL_PASS)',
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_USER}>`,
      to: toEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
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

  // Mail al correo del proyecto
  if (adminEnabled) {
    if (!adminTo) {
      logger.warn(
        { orderId: ctx.order.id },
        'MAIL_ADMIN_ENABLED=true but MAIL_TO is empty, admin email skipped',
      );
    } else {
      const rendered = renderOrderAdminEmail(ctx.order, ctx.items);
      await sendOne('order_admin', adminTo, rendered, ctx.order.id, true);
    }
  } else {
    // Registramos el evento como skipped para auditoría
    if (adminTo) {
      const rendered = renderOrderAdminEmail(ctx.order, ctx.items);
      await sendOne('order_admin', adminTo, rendered, ctx.order.id, false);
    }
  }

  // Mail al cliente
  if (clientEnabled && ctx.order.customerEmail) {
    const rendered = renderOrderClientEmail(ctx.order, ctx.items);
    await sendOne(
      'order_client',
      ctx.order.customerEmail,
      rendered,
      ctx.order.id,
      true,
    );
  } else if (ctx.order.customerEmail) {
    const rendered = renderOrderClientEmail(ctx.order, ctx.items);
    await sendOne(
      'order_client',
      ctx.order.customerEmail,
      rendered,
      ctx.order.id,
      false,
    );
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