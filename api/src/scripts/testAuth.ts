import { env } from '../config/env.js';

async function main() {
  const email = env.ADMIN_EMAIL;
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: pnpm auth:test "<password>"');
    process.exit(1);
  }

  const loginRes = await fetch(`${env.API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const loginBody = (await loginRes.json()) as {
    data?: { token: string };
    error?: { message: string };
  };

  if (!loginRes.ok || !loginBody.data?.token) {
    console.error('Login failed:', loginRes.status, loginBody);
    process.exit(1);
  }

  const token = loginBody.data.token;
  console.log('Login OK. Token length:', token.length);

  const meRes = await fetch(`${env.API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meBody = await meRes.json();
  console.log('GET /me →', meRes.status, meBody);

  const badRes = await fetch(`${env.API_URL}/api/v1/auth/me`, {
    headers: { Authorization: 'Bearer invalidtoken' },
  });
  const badBody = await badRes.json();
  console.log('GET /me (token inválido) →', badRes.status, badBody);

  const noRes = await fetch(`${env.API_URL}/api/v1/auth/me`);
  const noBody = await noRes.json();
  console.log('GET /me (sin token) →', noRes.status, noBody);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});