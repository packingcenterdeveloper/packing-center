import { desc, eq } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  payments,
  type NewPayment,
  type Payment,
} from '../../db/schema/index.js';

export async function create(data: NewPayment): Promise<Payment> {
  const [row] = await db.insert(payments).values(data).returning();
  return row!;
}

export async function findById(id: string): Promise<Payment | undefined> {
  return db.query.payments.findFirst({
    where: eq(payments.id, id),
  });
}

export async function findByOrderId(
  orderId: string,
): Promise<Payment | undefined> {
  return db.query.payments.findFirst({
    where: eq(payments.orderId, orderId),
    orderBy: [desc(payments.createdAt)],
  });
}

export async function findByMpPaymentId(
  mpPaymentId: string,
): Promise<Payment | undefined> {
  return db.query.payments.findFirst({
    where: eq(payments.mpPaymentId, mpPaymentId),
  });
}

export async function update(
  id: string,
  data: Partial<NewPayment>,
): Promise<Payment | undefined> {
  const [row] = await db
    .update(payments)
    .set(data)
    .where(eq(payments.id, id))
    .returning();
  return row;
}