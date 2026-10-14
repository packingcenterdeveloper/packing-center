import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  couponAssignments,
  coupons,
  presentations,
  products,
  type Coupon,
  type CouponAssignment,
  type NewCoupon,
  type NewCouponAssignment,
} from '../../db/schema/index.js';

export async function findAll(
  onlyActive: boolean,
): Promise<CouponWithAssignments[]> {
  const rows = await db.query.coupons.findMany({
    where: onlyActive ? eq(coupons.isActive, true) : undefined,
    orderBy: [desc(coupons.createdAt)],
    with: {
      assignments: {
        orderBy: [asc(couponAssignments.id)],
        with: {
          product: {
            columns: { id: true, name: true, slug: true },
          },
          presentation: {
            columns: { id: true, type: true, priceCents: true, isActive: true },
          },
        },
      },
    },
  });
  return rows;
}

export async function findById(
  id: number,
): Promise<CouponWithAssignments | undefined> {
  return db.query.coupons.findFirst({
    where: eq(coupons.id, id),
    with: {
      assignments: {
        orderBy: [asc(couponAssignments.id)],
        with: {
          product: {
            columns: { id: true, name: true, slug: true },
          },
          presentation: {
            columns: { id: true, type: true, priceCents: true, isActive: true },
          },
        },
      },
    },
  });
}

export async function findByCode(code: string): Promise<Coupon | undefined> {
  return db.query.coupons.findFirst({
    where: eq(coupons.code, code),
  });
}

export async function create(data: NewCoupon): Promise<Coupon> {
  const [row] = await db.insert(coupons).values(data).returning();
  return row!;
}

export async function update(
  id: number,
  data: Partial<NewCoupon>,
): Promise<Coupon | undefined> {
  const [row] = await db
    .update(coupons)
    .set(data)
    .where(eq(coupons.id, id))
    .returning();
  return row;
}

export async function remove(id: number): Promise<boolean> {
  const rows = await db
    .delete(coupons)
    .where(eq(coupons.id, id))
    .returning({ id: coupons.id });
  return rows.length > 0;
}

export async function incrementUsedCount(id: number): Promise<void> {
  await db
    .update(coupons)
    .set({ usedCount: sql`${coupons.usedCount} + 1` })
    .where(eq(coupons.id, id));
}

// --- Assignments ---

export async function findAssignmentById(
  id: number,
): Promise<CouponAssignment | undefined> {
  return db.query.couponAssignments.findFirst({
    where: eq(couponAssignments.id, id),
  });
}

export async function findAssignmentConflict(
  couponId: number,
  presentationId: number,
): Promise<CouponAssignment | undefined> {
  return db.query.couponAssignments.findFirst({
    where: and(
      eq(couponAssignments.couponId, couponId),
      eq(couponAssignments.presentationId, presentationId),
    ),
  });
}

export async function createAssignment(
  data: NewCouponAssignment,
): Promise<CouponAssignment> {
  const [row] = await db
    .insert(couponAssignments)
    .values(data)
    .returning();
  return row!;
}

export async function removeAssignment(id: number): Promise<boolean> {
  const rows = await db
    .delete(couponAssignments)
    .where(eq(couponAssignments.id, id))
    .returning({ id: couponAssignments.id });
  return rows.length > 0;
}

export async function findAssignmentForPresentation(
  couponId: number,
  presentationId: number,
): Promise<CouponAssignment | undefined> {
  return db.query.couponAssignments.findFirst({
    where: and(
      eq(couponAssignments.couponId, couponId),
      eq(couponAssignments.presentationId, presentationId),
      eq(couponAssignments.isActive, true),
    ),
  });
}

export interface CouponWithAssignments extends Coupon {
  assignments: Array<
    CouponAssignment & {
      product: { id: number; name: string; slug: string };
      presentation: {
        id: number;
        type: 'unidad' | 'paquete' | 'bulto' | 'caja';
        priceCents: number;
        isActive: boolean;
      };
    }
  >;
}