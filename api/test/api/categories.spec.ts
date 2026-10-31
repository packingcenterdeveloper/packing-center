import { test, expect } from '@playwright/test';

const TEST_ADMIN_EMAIL = 'packingcenterdeveloper@gmail.com';
const TEST_ADMIN_PASSWORD = 'p4ckingCenterDeVel0p3r';

let adminToken: string;
let testCategoryId: number;
let testCategoryName: string;

test.describe('CRUD /categories (Admin)', () => {

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/v1/auth/login', {
      data: { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD },
    });
    const body = await res.json();
    adminToken = body.data.token;
  });

  test.afterAll(async ({ request }) => {
    if (testCategoryId) {
      await new Promise(r => setTimeout(r, 500));
      await request.delete(`/api/v1/categories/${testCategoryId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
  });

  test('1. Debería fallar al crear sin token (401)', async ({ request }) => {
    const res = await request.post('/api/v1/categories', {
      data: { name: 'Cat Sin Token' },
    });
    expect(res.status()).toBe(401);
  });

  test('2. Debería fallar con nombre vacío (400 Zod)', async ({ request }) => {
    const res = await request.post('/api/v1/categories', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: '' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('3. Debería crear una categoría exitosamente (201)', async ({ request }) => {
    testCategoryName = `Categoría Test QA ${Date.now()}`;
    const res = await request.post('/api/v1/categories', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: testCategoryName,
        description: 'Creada por Playwright',
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    
    // REGLA DE ORO: Guardar antes de las aserciones
    testCategoryId = body.data.id; 
    expect(testCategoryId).toBeDefined();
    expect(body.data.name).toBe(testCategoryName);
  });

  test('4. Debería fallar si intento crear una categoría con el mismo nombre (409)', async ({ request }) => {
    // Usamos el mismo nombre exacto del test 3
    const res = await request.post('/api/v1/categories', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: testCategoryName }, 
    });
    expect(res.status()).toBe(409);
  });

  test('5. Debería fallar al borrar una categoría con productos (409 Restrict)', async ({ request }) => {
    await request.post('/api/v1/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: `Producto Temporal ${Date.now()}`, categoryId: testCategoryId },
    });

    const res = await request.delete(`/api/v1/categories/${testCategoryId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.error.message).toContain('still assigned to it');
  });
});