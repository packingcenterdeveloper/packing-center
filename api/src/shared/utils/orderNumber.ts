import { client } from '../../config/turso.js';

export async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const key = `order_counter_${year}`;

  await client.execute({
    sql: `INSERT INTO settings (key, value, updated_at)
          VALUES (?, '0', unixepoch())
          ON CONFLICT(key) DO NOTHING`,
    args: [key],
  });

  const result = await client.execute({
    sql: `UPDATE settings
          SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT),
              updated_at = unixepoch()
          WHERE key = ?
          RETURNING value`,
    args: [key],
  });

  const raw = result.rows[0]?.value;
  const counter = String(raw ?? '1').padStart(6, '0');
  return `PC-${year}-${counter}`;
}