import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { orders } from './orders.js';

export const EMAIL_EVENT_TYPES = [
  'order_admin',
  'order_client',
] as const;

export type EmailEventType = (typeof EMAIL_EVENT_TYPES)[number];

export const EMAIL_EVENT_STATUSES = [
  'pending',
  'sent',
  'failed',
  'skipped',
] as const;

export type EmailEventStatus = (typeof EMAIL_EVENT_STATUSES)[number];

export const emailEvents = sqliteTable(
  'email_events',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id').references(() => orders.id, {
      onDelete: 'set null',
    }),

    type: text('type', { enum: EMAIL_EVENT_TYPES }).notNull(),
    toEmail: text('to_email').notNull(),
    subject: text('subject').notNull(),

    status: text('status', { enum: EMAIL_EVENT_STATUSES })
      .notNull()
      .default('pending'),
    error: text('error'),
    sentAt: integer('sent_at', { mode: 'timestamp' }),

    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    orderIdx: index('email_events_order_id_idx').on(table.orderId),
    statusIdx: index('email_events_status_idx').on(table.status),
  }),
);

export type EmailEvent = typeof emailEvents.$inferSelect;
export type NewEmailEvent = typeof emailEvents.$inferInsert;