import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { orders } from './orders.js';

export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),

    provider: text('provider').notNull().default('mercadopago'),
    mpPreferenceId: text('mp_preference_id'),
    mpPaymentId: text('mp_payment_id').unique(),
    mpStatus: text('mp_status'),
    mpStatusDetail: text('mp_status_detail'),

    amountCents: integer('amount_cents').notNull(),

    rawPayload: text('raw_payload', { mode: 'json' }).$type<
      Record<string, unknown>
    >(),

    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    orderIdx: index('payments_order_id_idx').on(table.orderId),
  }),
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;