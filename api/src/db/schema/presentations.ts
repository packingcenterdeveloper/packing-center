import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { products } from './products.js';
import { relations } from 'drizzle-orm';
import { quantityDiscounts } from './quantityDiscounts.js';
import { couponAssignments } from './couponAssignments.js';


export const PRESENTATION_TYPES = [
  'unidad',
  'paquete',
  'bulto',
  'caja',
] as const;

export type PresentationType = (typeof PRESENTATION_TYPES)[number];

export const presentations = sqliteTable(
  'presentations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    type: text('type', { enum: PRESENTATION_TYPES }).notNull(),
    sku: text('sku'),
    priceCents: integer('price_cents').notNull(),
    stock: integer('stock').notNull().default(0),
    stockReserved: integer('stock_reserved').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' })
      .notNull()
      .default(true),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    productIdx: index('presentations_product_id_idx').on(table.productId),
    productTypeUnique: uniqueIndex('presentations_product_type_unique').on(
      table.productId,
      table.type,
    ),
    skuUnique: uniqueIndex('presentations_sku_unique').on(table.sku),
  }),
);

export const presentationsRelations = relations(
  presentations,
  ({ one, many }) => ({
    product: one(products, {
      fields: [presentations.productId],
      references: [products.id],
    }),
    quantityDiscounts: many(quantityDiscounts),
    couponAssignments: many(couponAssignments),
  }),
);

export type Presentation = typeof presentations.$inferSelect;
export type NewPresentation = typeof presentations.$inferInsert;