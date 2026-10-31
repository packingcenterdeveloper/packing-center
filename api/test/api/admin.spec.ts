import { test, expect } from '@playwright/test';

const TEST_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

let adminToken: string;

test.describe('Admin Settings & Dashboard', () => {

  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post('/api/v1/auth/login', {
      data: { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD },
    });
    adminToken = (await loginRes.json()).data.token;
  });

  test('1. Debería obtener la configuración actual (200)', async ({ request }) => {
    const res = await request.get('/api/v1/admin/settings', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    // Verificamos que existan los flags de mail
    const mailFlag = body.data.find((s: any) => s.key === 'MAIL_ADMIN_ENABLED');
    expect(mailFlag).toBeDefined();
  });

  test('2. Debería actualizar el mail destino (200)', async ({ request }) => {
    const res = await request.patch('/api/v1/admin/settings', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { MAIL_TO: 'nuevo-destino@test.com' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const updated = body.data.find((s: any) => s.key === 'MAIL_TO');
    expect(updated.value).toBe('nuevo-destino@test.com');
  });

  test('3. Debería obtener métricas del dashboard (200)', async ({ request }) => {
    const res = await request.get('/api/v1/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    
    expect(body.data).toHaveProperty('statusCounts');
    expect(body.data).toHaveProperty('revenue');
    expect(body.data).toHaveProperty('orders');
    expect(body.data.revenue.allTime).toBeGreaterThanOrEqual(0);
  });
});