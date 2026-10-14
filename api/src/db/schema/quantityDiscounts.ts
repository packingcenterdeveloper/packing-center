import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  index,
} from 'drizzle-orm/sqlite-core';
import { products } from './products.js';
import { presentations } from './presentations.js';
import { relations } from 'drizzle-orm';

export const quantityDiscounts = sqliteTable(
  'quantity_discounts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
    presentationId: integer('presentation_id')
    .notNull()
    .references(() => presentations.id, { onDelete: 'cascade' }),
    minQuantity: integer('min_quantity').notNull(),
    percent: integer('percent').notNull(),
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
    presentationIdx: index('quantity_discounts_presentation_id_idx').on(
      table.presentationId,
      ),
    productIdx: index('quantity_discounts_product_id_idx').on(table.productId),
  }),
  );

export const quantityDiscountsRelations = relations(
  quantityDiscounts,
  ({ one }) => ({
    product: one(products, {
      fields: [quantityDiscounts.productId],
      references: [products.id],
    }),
    presentation: one(presentations, {
      fields: [quantityDiscounts.presentationId],
      references: [presentations.id],
    }),
  }),
  );

export type QuantityDiscount = typeof quantityDiscounts.$inferSelect;
export type NewQuantityDiscount = typeof quantityDiscounts.$inferInsert;