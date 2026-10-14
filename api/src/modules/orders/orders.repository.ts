import { and, asc, desc, eq, like, or, sql } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  orderItems,
  orders,
  orderStatusHistory,
  type NewOrder,
  type NewOrderItem,
  type NewOrderStatusHistory,
  type Order,
  type OrderItem,
  type OrderStatus,
  type OrderStatusHistory,
} from '../../db/schema/index.js';

export interface ListFilters {
  status?: OrderStatus;
  unseenOnly: boolean;
  search?: string;
  page: number;
  limit: number;
}

export async function create(data: NewOrder): Promise<Order> {
  const [row] = await db.insert(orders).values(data).returning();
  return row!;
}

export async function createItems(
  items: NewOrderItem[],
): Promise<OrderItem[]> {
  if (items.length === 0) return [];
  return db.insert(orderItems).values(items).returning();
}

export async function addStatusHistory(
  data: NewOrderStatusHistory,
): Promise<void> {
  await db.insert(orderStatusHistory).values(data);
}

export async function findById(id: string): Promise<Order | undefined> {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
  });
}

export async function findItems(orderId: string): Promise<OrderItem[]> {
  return db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(asc(orderItems.createdAt));
}

export async function findHistory(
  orderId: string,
): Promise<OrderStatusHistory[]> {
  return db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(asc(orderStatusHistory.createdAt));
}

export async function findByPhone(phone: string): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerPhone, phone))
    .orderBy(desc(orders.createdAt));
}

export async function update(
  id: string,
  data: Partial<NewOrder>,
): Promise<Order | undefined> {
  const [row] = await db
    .update(orders)
    .set(data)
    .where(eq(orders.id, id))
    .returning();
  return row;
}

export async function remove(id: string): Promise<boolean> {
  const rows = await db
    .delete(orders)
    .where(eq(orders.id, id))
    .returning({ id: orders.id });
  return rows.length > 0;
}

export interface ListResult {
  rows: Order[];
  total: number;
}

export async function findAll(filters: ListFilters): Promise<ListResult> {
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(orders.status, filters.status));
  }
  if (filters.unseenOnly) {
    conditions.push(sql`${orders.seenByAdminAt} IS NULL`);
  }
  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        like(orders.orderNumber, pattern),
        like(orders.customerName, pattern),
        like(orders.customerPhone, pattern),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (filters.page - 1) * filters.limit;

  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(filters.limit)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(where);

  return {
    rows,
    total: Number(countRow?.count ?? 0),
  };
}

export async function countByStatus(): Promise<
  Record<OrderStatus, number>
> {
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