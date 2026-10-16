import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { categories } from './categories.js';
import { relations } from 'drizzle-orm';
import { productImages } from './productImages.js';
import { presentations } from './presentations.js';
import { quantityDiscounts } from './quantityDiscounts.js';
import { coupons } from './coupons.js';

export const products = sqliteTable(
  'products',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    measures: text('measures'),
    subcategory: text('subcategory'),
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
    categoryIdx: index('products_category_id_idx').on(table.categoryId),
    subcategoryIdx: index('products_subcategory_idx').on(table.subcategory),
    nameIdx: index('products_name_idx').on(table.name),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  presentations: many(presentations),
  quantityDiscounts: many(quantityDiscounts),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;