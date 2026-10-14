import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { orders, type OrderStatus } from './orders.js';

export const orderStatusHistory = sqliteTable(
  'order_status_history',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    fromStatus: text('from_status', { enum: ['pending', 'paid', 'preparing', 'dispatched', 'delivered', 'cancelled'] }),
    toStatus: text('to_status', { enum: ['pending', 'paid', 'preparing', 'dispatched', 'delivered', 'cancelled'] })
      .$type<OrderStatus>()
      .notNull(),
    note: text('note'),
    changedBy: text('changed_by').notNull().default('system'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    orderIdx: index('order_status_history_order_id_idx').on(table.orderId),
  }),
);

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistory = typeof orderStatusHistory.$inferInsert;