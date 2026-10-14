import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { coupons } from './coupons.js';
import { products } from './products.js';
import { presentations } from './presentations.js';
import { relations } from 'drizzle-orm';

export const couponAssignments = sqliteTable(
  'coupon_assignments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    couponId: integer('coupon_id')
      .notNull()
      .references(() => coupons.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    presentationId: integer('presentation_id')
      .notNull()
      .references(() => presentations.id, { onDelete: 'cascade' }),
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
    couponIdx: index('coupon_assignments_coupon_id_idx').on(table.couponId),
    productIdx: index('coupon_assignments_product_id_idx').on(table.productId),
    presentationIdx: index('coupon_assignments_presentation_id_idx').on(
      table.presentationId,
    ),
    couponPresentationUnique: uniqueIndex(
      'coupon_assignments_coupon_presentation_unique',
    ).on(table.couponId, table.presentationId),
  }),
);

export const couponAssignmentsRelations = relations(
  couponAssignments,
  ({ one }) => ({
    coupon: one(coupons, {
      fields: [couponAssignments.couponId],
      references: [coupons.id],
    }),
    product: one(products, {
      fields: [couponAssignments.productId],
      references: [products.id],
    }),
    presentation: one(presentations, {
      fields: [couponAssignments.presentationId],
      references: [presentations.id],
    }),
  }),
);

export type CouponAssignment = typeof couponAssignments.$inferSelect;
export type NewCouponAssignment = typeof couponAssignments.$inferInsert;