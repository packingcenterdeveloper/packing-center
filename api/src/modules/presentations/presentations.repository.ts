import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  presentations,
  type NewPresentation,
  type Presentation,
  type PresentationType,
} from '../../db/schema/index.js';

const TYPE_ORDER_SQL = sql`
  CASE ${presentations.type}
    WHEN 'unidad' THEN 1
    WHEN 'paquete' THEN 2
    WHEN 'bulto' THEN 3
    WHEN 'caja' THEN 4
    ELSE 5
  END
`;

export async function findByProduct(
  productId: number,
): Promise<Presentation[]> {
  return db
    .select()
    .from(presentations)
    .where(eq(presentations.productId, productId))
    .orderBy(TYPE_ORDER_SQL);
}

export async function findById(
  id: number,
): Promise<Presentation | undefined> {
  return db.query.presentations.findFirst({
    where: eq(presentations.id, id),
  });
}

export async function findConflictByType(
  productId: number,
  type: PresentationType,
): Promise<Presentation | undefined> {
  return db.query.presentations.findFirst({
    where: and(
      eq(presentations.productId, productId),
      eq(presentations.type, type),
    ),
  });
}

export async function findSkuConflict(
  sku: string,
  excludeId?: number,
): Promise<Presentation | undefined> {
  const found = await db.query.presentations.findFirst({
    where: eq(presentations.sku, sku),
  });
  if (!found) return undefined;
  if (excludeId !== undefined && found.id === excludeId) return undefined;
  return found;
}

export async function create(data: NewPresentation): Promise<Presentation> {
  const [row] = await db.insert(presentations).values(data).returning();
  return row!;
}

export async function update(
  id: number,
  data: Partial<NewPresentation>,
): Promise<Presentation | undefined> {
  const [row] = await db
    .update(presentations)
    .set(data)
    .where(eq(presentations.id, id))
    .returning();
  return row;
}

export async function remove(id: number): Promise<boolean> {
  const rows = await db
    .delete(presentations)
    .where(eq(presentations.id, id))
    .returning({ id: presentations.id });
  return rows.length > 0;
}