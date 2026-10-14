import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from './env.js';
import * as schema from '../db/schema/index.js';

export const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

export async function checkDbConnection(): Promise<void> {
  await client.execute('SELECT 1');
}