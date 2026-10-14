import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  index,
} from 'drizzle-orm/sqlite-core';

export const ORDER_STATUSES = [
  'pending',
  'paid',
  'preparing',
  'dispatched',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_PAYMENT_METHODS = [
  'mercadopago',
  'cash',
  'transfer',
] as const;

export type OrderPaymentMethod = (typeof ORDER_PAYMENT_METHODS)[number];

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    orderNumber: text('order_number').notNull().unique(),

    customerName: text('customer_name').notNull(),
    customerPhone: text('customer_phone').notNull(),
    customerEmail: text('customer_email'),
    customerAddress: text('customer_address'),
    customerCity: text('customer_city'),
    customerNotes: text('customer_notes'),

    shippingDepartment: text('shipping_department'),
    shippingIsFree: integer('shipping_is_free', { mode: 'boolean' })
      .notNull()
      .default(false),
    shippingCostLabel: text('shipping_cost_label'),

    subtotalCents: integer('subtotal_cents').notNull(),
    discountCents: integer('discount_cents').notNull().default(0),
    totalCents: integer('total_cents').notNull(),

    status: text('status', { enum: ORDER_STATUSES })
      .notNull()
      .default('pending'),
    paymentMethod: text('payment_method', { enum: ORDER_PAYMENT_METHODS }),

    paidAt: integer('paid_at', { mode: 'timestamp' }),
    seenByAdminAt: integer('seen_by_admin_at', { mode: 'timestamp' }),
    reservationExpiresAt: integer('reservation_expires_at', {
      mode: 'timestamp',
    }),

    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index('orders_status_idx').on(table.status),
    phoneIdx: index('orders_customer_phone_idx').on(table.customerPhone),
    createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
    seenByIdx: index('orders_seen_by_admin_at_idx').on(table.seenByAdminAt),
  }),
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;