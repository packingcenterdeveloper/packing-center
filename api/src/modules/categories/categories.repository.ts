import { asc, eq, sql } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  categories,
  products,
  type Category,
  type NewCategory,
} from '../../db/schema/index.js';

export async function findAll(onlyActive: boolean): Promise<Category[]> {
  return db.query.categories.findMany({
    where: onlyActive ? eq(categories.isActive, true) : undefined,
    orderBy: [asc(categories.sortOrder), asc(categories.name)],
  });
}

export async function findById(id: number): Promise<Category | undefined> {
  return db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
}

export async function findBySlug(slug: string): Promise<Category | undefined> {
  return db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });
}

export async function findSlugConflict(
  slug: string,
  excludeId?: number,
): Promise<Category | undefined> {
  const found = await findBySlug(slug);
  if (!found) return undefined;
  if (excludeId !== undefined && found.id === excludeId) return undefined;
  return found;
}

export async function create(data: NewCategory): Promise<Category> {
  const [row] = await db.insert(categories).values(data).returning();
  return row!;
}

export async function update(
  id: number,
  data: Partial<NewCategory>,
): Promise<Category | undefined> {
  const [row] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();
  return row;
}

export async function remove(id: number): Promise<boolean> {
  const rows = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning({ id: categories.id });
  return rows.length > 0;
}

export async function countProducts(categoryId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.categoryId, categoryId));
  return Number(row?.count ?? 0);
}