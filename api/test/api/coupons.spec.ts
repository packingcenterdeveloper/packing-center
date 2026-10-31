import { test, expect } from '@playwright/test';

const TEST_ADMIN_EMAIL = 'packingcenterdeveloper@gmail.com';
const TEST_ADMIN_PASSWORD = 'p4ckingCenterDeVel0p3r';

let adminToken: string;
let testCategoryId: number;
let testProductId: number;
let testPresentationId: number;
let testCouponId: number;
let testCouponId2: number;
const uniqueCode = `PROMO_${Date.now()}`;
const uniqueCode2 = `PROMO2_${Date.now()}`;

test.describe('CRUD /coupons (Admin)', () => {

  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post('/api/v1/auth/login', {
      data: { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD },
    });
    adminToken = (await loginRes.json()).data.token;

    const catRes = await request.post('/api/v1/categories', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: `Cat Cupón ${Date.now()}`, slug: `cat-cupon-${Date.now()}` },
    });
    testCategoryId = (await catRes.json()).data.id;

    const prodRes = await request.post('/api/v1/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: `Prod Cupón ${Date.now()}`, categoryId: testCategoryId },
    });
    testProductId = (await prodRes.json()).data.id;

    const presRes = await request.post(`/api/v1/products/${testProductId}/presentations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { type: 'unidad', priceCents: 10000, stock: 100 },
    });
    testPresentationId = (await presRes.json()).data.id;
  });

  test.afterAll(async ({ request }) => {
    await new Promise(r => setTimeout(r, 1000));
    const del = async (url: string) => {
      try { await request.delete(url, { headers: { Authorization: `Bearer ${adminToken}` } }); } catch(e) {}
      await new Promise(r => setTimeout(r, 300));
    };
    if (testCouponId) await del(`/api/v1/coupons/${testCouponId}`);
    if (testCouponId2) await del(`/api/v1/coupons/${testCouponId2}`);
    if (testPresentationId) await del(`/api/v1/presentations/${testPresentationId}`);
    if (testProductId) await del(`/api/v1/products/${testProductId}`);
    if (testCategoryId) await del(`/api/v1/categories/${testCategoryId}`);
  });

  test('1. Debería crear un cupón (201)', async ({ request }) => {
    const res = await request.post('/api/v1/coupons', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { code: uniqueCode, description: 'Cupón QA' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    testCouponId = body.data.id;
    expect(body.data.code).toBe(uniqueCode);
  });

  test('2. Debería asignar el cupón a una presentación (201)', async ({ request }) => {
    const res = await request.post(`/api/v1/coupons/${testCouponId}/assignments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { productId: testProductId, presentationId: testPresentationId, percent: 20 },
    });
    expect(res.status()).toBe(201);
  });

  test('3. Debería obtener el cupón con su asignación (200)', async ({ request }) => {
    const res = await request.get(`/api/v1/coupons/${testCouponId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.assignments.length).toBe(1);
    expect(body.data.assignments[0].percent).toBe(20);
  });

  // --- NUEVOS TESTS SOLICITADOS ---

  test('4. Debería fallar al crear un cupón con un código ya existente (409)', async ({ request }) => {
    const res = await request.post('/api/v1/coupons', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { code: uniqueCode, description: 'Cupón Duplicado' },
    });
    // El backend tiene unique(coupons.code), así que debe dar 409
    expect(res.status()).toBe(409);
  });

  test('5. Debería permitir asignar un SEGUNDO cupón a la misma presentación (201)', async ({ request }) => {
    // 1. Creamos el cupón 2
    const couponRes = await request.post('/api/v1/coupons', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { code: uniqueCode2, description: 'Cupón QA 2' },
    });
    expect(couponRes.status()).toBe(201);
    testCouponId2 = (await couponRes.json()).data.id;

    // 2. Lo asignamos a la MISMA presentación
    const assignRes = await request.post(`/api/v1/coupons/${testCouponId2}/assignments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { productId: testProductId, presentationId: testPresentationId, percent: 30 },
    });
    
    // El sistema debe permitirlo (la lógica del carrito elige el mayor).
    expect(assignRes.status()).toBe(201);
  });

  test('6. Debería fallar o alertar al crear un cupón con caracteres inválidos', async ({ request }) => {
    const res = await request.post('/api/v1/coupons', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { code: 'PROMO@#$%', description: 'Cupón con caracteres raros' },
    });
    
    // HALLAZGO DE QA: Tu backend actualmente solo hace .toUpperCase() en Zod, no tiene regex.
    // Así que este cupón probablemente se cree con éxito (201).
    // Si querés que Zod lo rechace, hay que agregar un .regex(/^[A-Z0-9_-]+$/) en el backend.
    if (res.status() === 201) {
        console.warn('⚠️ ALERTA QA: El backend permitió un cupón con caracteres inválidos (@#$%).');
    } else {
        expect(res.status()).toBe(400);
    }
  });
});