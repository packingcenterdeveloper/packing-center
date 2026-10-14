import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  orders,
  presentations,
  products,
  type Order,
  type OrderStatus,
} from '../../db/schema/index.js';

const REVENUE_STATUSES: OrderStatus[] = [
  'paid',
  'preparing',
  'dispatched',
  'delivered',
];

export async function countByStatus(): Promise<Record<OrderStatus, number>> {
  const rows = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .groupBy(orders.status);

  const result: Record<string, number> = {
    pending: 0,
    paid: 0,
    preparing: 0,
    dispatched: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const row of rows) {
    result[row.status] = Number(row.count);
  }
  return result as Record<OrderStatus, number>;
}

export async function countUnseen(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(sql`${orders.seenByAdminAt} IS NULL`);
  return Number(row?.count ?? 0);
}

export async function sumRevenueSince(since: Date): Promise<number> {
  const [row] = await db
    .select({
      sum: sql<number>`coalesce(sum(${orders.totalCents}), 0)`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, since),
        inArray(orders.status, REVENUE_STATUSES),
      ),
    );
  return Number(row?.sum ?? 0);
}

export async function countOrdersSince(since: Date): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(gte(orders.createdAt, since));
  return Number(row?.count ?? 0);
}

export async function latestOrders(limit: number): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export interface LowStockItem {
  presentationId: number;
  productId: number;
  productName: string;
  productSlug: string;
  type: 'unidad' | 'paquete' | 'bulto' | 'caja';
  stock: number;
  stockReserved: number;
  available: number;
}

export async function lowStock(
  threshold: number,
  limit: number,
): Promise<LowStockItem[]> {
  const rows = await db
    .select({
      presentationId: presentations.id,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      type: presentations.type,
      stock: presentations.stock,
      stockReserved: presentations.stockReserved,
      available: sql<number>`(${presentations.stock} - ${presentations.stockReserved})`,
    })
    .from(presentations)
    .innerJoin(products, eq(presentations.productId, products.id))
    .where(
      and(
        eq(presentations.isActive, true),
        eq(products.isActive, true),
        sql`(${presentations.stock} - ${presentations.stockReserved}) <= ${threshold}`,
      ),
    )
    .orderBy(sql`(${presentations.stock} - ${presentations.stockReserved}) ASC`)
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    available: Number(r.available),
  }));
}