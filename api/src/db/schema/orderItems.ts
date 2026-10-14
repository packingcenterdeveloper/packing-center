import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { orders } from './orders.js';
import { products } from './products.js';
import { presentations, type PresentationType } from './presentations.js';

export const orderItems = sqliteTable(
  'order_items',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),

    productId: integer('product_id').references(() => products.id, {
      onDelete: 'set null',
    }),
    presentationId: integer('presentation_id').references(
      () => presentations.id,
      { onDelete: 'set null' },
    ),

    productName: text('product_name').notNull(),
    presentationType: text('presentation_type').$type<PresentationType>().notNull(),

    unitPriceCents: integer('unit_price_cents').notNull(),
    quantity: integer('quantity').notNull(),

    quantityDiscountPercent: integer('quantity_discount_percent'),
    quantityDiscountCents: integer('quantity_discount_cents')
      .notNull()
      .default(0),

    couponCode: text('coupon_code'),
    couponDiscountPercent: integer('coupon_discount_percent'),
    couponDiscountCents: integer('coupon_discount_cents').notNull().default(0),

    lineSubtotalCents: integer('line_subtotal_cents').notNull(),
    lineTotalCents: integer('line_total_cents').notNull(),

    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    orderIdx: index('order_items_order_id_idx').on(table.orderId),
    productIdx: index('order_items_product_id_idx').on(table.productId),
  }),
);

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;