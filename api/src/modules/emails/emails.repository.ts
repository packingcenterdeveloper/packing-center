import { desc, eq } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  emailEvents,
  type EmailEvent,
  type NewEmailEvent,
} from '../../db/schema/index.js';

export async function create(data: NewEmailEvent): Promise<EmailEvent> {
  const [row] = await db.insert(emailEvents).values(data).returning();
  return row!;
}

export async function update(
  id: string,
  data: Partial<NewEmailEvent>,
): Promise<EmailEvent | undefined> {
  const [row] = await db
    .update(emailEvents)
    .set(data)
    .where(eq(emailEvents.id, id))
    .returning();
  return row;
}

export async function findByOrder(
  orderId: string,
): Promise<EmailEvent[]> {
  return db
    .select()
    .from(emailEvents)
    .where(eq(emailEvents.orderId, orderId))
    .orderBy(desc(emailEvents.createdAt));
}