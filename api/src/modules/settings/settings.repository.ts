import { eq } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import { settings, type Setting } from '../../db/schema/index.js';

export async function findAll(): Promise<Setting[]> {
  return db.select().from(settings);
}

export async function findByKey(key: string): Promise<Setting | undefined> {
  return db.query.settings.findFirst({
    where: eq(settings.key, key),
  });
}

export async function upsert(key: string, value: string): Promise<Setting> {
  const [row] = await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date() },
    })
    .returning();
  return row!;
}