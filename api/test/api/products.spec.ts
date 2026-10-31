import { test, expect } from '@playwright/test';

const TEST_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

let adminToken: string;
let testCategoryId: number;
let testProductId: number;
let testProductSlug: string;
let testProductName: string;

test.describe('CRUD /products (Admin)', () => {

  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post('/api/v1/auth/login', {
      data: { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD },
    });
    adminToken = (await loginRes.json()).data.token;

    const catRes = await request.post('/api/v1/categories', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: `Cat Test Prod ${Date.now()}`, slug: `cat-prod-${Date.now()}` },
    });
    testCategoryId = (await catRes.json()).data.id;
  });

  test.afterAll(async ({ request }) => {
    await new Promise(r => setTimeout(r, 1000));
    const del = async (url: string) => {
      try { await request.delete(url, { headers: { Authorization: `Bearer ${adminToken}` } }); } catch (e) { }
      await new Promise(r => setTimeout(r, 300));
    };
    if (testProductId) await del(`/api/v1/products/${testProductId}`);
    if (testCategoryId) await del(`/api/v1/categories/${testCategoryId}`);
  });

  test('1. Debería fallar al crear producto sin token (401)', async ({ request }) => {
    const res = await request.post('/api/v1/products', {
      data: { name: 'Producto Sin Token', categoryId: testCategoryId },
    });
    expect(res.status()).toBe(401);
  });

  test('2. Debería fallar si la categoría no existe (404)', async ({ request }) => {
    const res = await request.post('/api/v1/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: 'Producto Invalido', categoryId: 999999 },
    });
    expect(res.status()).toBe(404);
  });

  test('3. Debería crear un producto exitosamente (201)', async ({ request }) => {
    testProductName = `Producto Test Playwright ${Date.now()}`;
    const res = await request.post('/api/v1/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: testProductName,
        categoryId: testCategoryId,
        description: 'Un producto para testear',
        isActive: true,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    
    // REGLA DE ORO
    testProductId = body.data.id;
    testProductSlug = body.data.slug;
    
    expect(testProductId).toBeDefined();
    expect(body.data.name).toBe(testProductName);
  });

  test('4. Debería obtener el producto por slug (200)', async ({ request }) => {
    const res = await request.get(`/api/v1/products/${testProductSlug}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe(testProductName);
  });

  test('5. Debería fallar al borrar un producto con presentaciones (409 Restrict)', async ({ request }) => {
    await request.post(`/api/v1/products/${testProductId}/presentations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { type: 'unidad', priceCents: 1000, stock: 10 },
    });

    const res = await request.delete(`/api/v1/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.error.message).toContain('presentation(s) still assigned');
  });
});