import { asc, eq, sql } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  productImages,
  type NewProductImage,
  type ProductImage,
} from '../../db/schema/index.js';

export async function findByProduct(
  productId: number,
): Promise<ProductImage[]> {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder), asc(productImages.id));
}

export async function findById(
  id: number,
): Promise<ProductImage | undefined> {
  return db.query.productImages.findFirst({
    where: eq(productImages.id, id),
  });
}

export async function findPublicIdConflict(
  publicId: string,
): Promise<ProductImage | undefined> {
  return db.query.productImages.findFirst({
    where: eq(productImages.publicId, publicId),
  });
}

export async function nextSortOrder(productId: number): Promise<number> {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${productImages.sortOrder}), -1)` })
    .from(productImages)
    .where(eq(productImages.productId, productId));
  return Number(row?.max ?? -1) + 1;
}

export async function create(data: NewProductImage): Promise<ProductImage> {
  const [row] = await db.insert(productImages).values(data).returning();
  return row!;
}

export async function update(
  id: number,
  data: Partial<NewProductImage>,
): Promise<ProductImage | undefined> {
  const [row] = await db
    .update(productImages)
    .set(data)
    .where(eq(productImages.id, id))
    .returning();
  return row;
}

export async function remove(id: number): Promise<boolean> {
  const rows = await db
    .delete(productImages)
    .where(eq(productImages.id, id))
    .returning({ id: productImages.id });
  return rows.length > 0;
}