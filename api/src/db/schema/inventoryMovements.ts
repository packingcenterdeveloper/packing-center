import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { presentations } from './presentations.js';
import { orders } from './orders.js';

export const INVENTORY_MOVEMENT_TYPES = [
  'reservation',
  'reservation_release',
  'sale',
  'sale_reversal',
  'manual_adjustment',
  'restock',
] as const;

export type InventoryMovementType =
  (typeof INVENTORY_MOVEMENT_TYPES)[number];

export const inventoryMovements = sqliteTable(
  'inventory_movements',
  {
    id: text('id').primaryKey(),
    presentationId: integer('presentation_id')
      .notNull()
      .references(() => presentations.id, { onDelete: 'cascade' }),
    orderId: text('order_id').references(() => orders.id, {
      onDelete: 'set null',
    }),

    type: text('type', { enum: INVENTORY_MOVEMENT_TYPES }).notNull(),
    quantity: integer('quantity').notNull(),

    stockBefore: integer('stock_before').notNull(),
    stockAfter: integer('stock_after').notNull(),
    stockReservedBefore: integer('stock_reserved_before').notNull(),
    stockReservedAfter: integer('stock_reserved_after').notNull(),

    note: text('note'),

    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    presentationIdx: index('inventory_movements_presentation_id_idx').on(
      table.presentationId,
    ),
    orderIdx: index('inventory_movements_order_id_idx').on(table.orderId),
    createdAtIdx: index('inventory_movements_created_at_idx').on(
      table.createdAt,
    ),
  }),
);

export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert;