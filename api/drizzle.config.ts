import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error(
    '[drizzle-kit] TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required in .env',
  );
}

export default defineConfig({
  dialect: 'turso',
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url,
    authToken,
  },
  verbose: true,
  strict: true,
});