import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  quantityDiscounts,
  type NewQuantityDiscount,
  type QuantityDiscount,
} from '../../db/schema/index.js';

export async function findByProduct(
  productId: number,
): Promise<QuantityDiscount[]> {
  return db
    .select()
    .from(quantityDiscounts)
    .where(eq(quantityDiscounts.productId, productId))
    .orderBy(
      asc(quantityDiscounts.presentationId),
      asc(quantityDiscounts.minQuantity),
    );
}

export async function findByPresentation(
  presentationId: number,
): Promise<QuantityDiscount[]> {
  return db
    .select()
    .from(quantityDiscounts)
    .where(eq(quantityDiscounts.presentationId, presentationId))
    .orderBy(asc(quantityDiscounts.minQuantity));
}

export async function findById(
  id: number,
): Promise<QuantityDiscount | undefined> {
  return db.query.quantityDiscounts.findFirst({
    where: eq(quantityDiscounts.id, id),
  });
}

export async function findConflict(
  presentationId: number,
  minQuantity: number,
  excludeId?: number,
): Promise<QuantityDiscount | undefined> {
  const found = await db.query.quantityDiscounts.findFirst({
    where: and(
      eq(quantityDiscounts.presentationId, presentationId),
      eq(quantityDiscounts.minQuantity, minQuantity),
    ),
  });
  if (!found) return undefined;
  if (excludeId !== undefined && found.id === excludeId) return undefined;
  return found;
}

export async function create(
  data: NewQuantityDiscount,
): Promise<QuantityDiscount> {
  const [row] = await db.insert(quantityDiscounts).values(data).returning();
  return row!;
}

export async function update(
  id: number,
  data: Partial<NewQuantityDiscount>,
): Promise<QuantityDiscount | undefined> {
  const [row] = await db
    .update(quantityDiscounts)
    .set(data)
    .where(eq(quantityDiscounts.id, id))
    .returning();
  return row;
}

export async function remove(id: number): Promise<boolean> {
  const rows = await db
    .delete(quantityDiscounts)
    .where(eq(quantityDiscounts.id, id))
    .returning({ id: quantityDiscounts.id });
  return rows.length > 0;
}