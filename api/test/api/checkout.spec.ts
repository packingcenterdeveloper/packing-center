import { test, expect } from '@playwright/test';

const TEST_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


let adminToken: string;
let testCategoryId: number;
let testProductId: number;
let testPresentationId: number;

test.describe('POST /orders/checkout (Mercado Pago)', () => {

  // ⚠️ ELIMINAR ESTA LÍNEA CUANDO TENGAS LAS CREDENCIALES DE MP EN EL .ENV
  test.skip(true, 'Esperando credenciales de Mercado Pago');

  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post('/api/v1/auth/login', {
      data: { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD },
    });
    adminToken = (await loginRes.json()).data.token;

    // Crear datos base (Categoría -> Producto -> Presentación)
    const catRes = await request.post('/api/v1/categories', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: `Cat Checkout ${Date.now()}`, slug: `cat-checkout-${Date.now()}` },
    });
    testCategoryId = (await catRes.json()).data.id;

    const prodRes = await request.post('/api/v1/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: `Prod Checkout ${Date.now()}`, categoryId: testCategoryId },
    });
    testProductId = (await prodRes.json()).data.id;

    const presRes = await request.post(`/api/v1/products/${testProductId}/presentations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { type: 'unidad', priceCents: 10000, stock: 10 },
    });
    testPresentationId = (await presRes.json()).data.id;
  });

  test.afterAll(async ({ request }) => {
    // Limpieza básica
    await new Promise(r => setTimeout(r, 1000));
    const del = async (url: string) => {
      try { await request.delete(url, { headers: { Authorization: `Bearer ${adminToken}` } }); } catch(e) {}
      await new Promise(r => setTimeout(r, 300));
    };
    if (testPresentationId) await del(`/api/v1/presentations/${testPresentationId}`);
    if (testProductId) await del(`/api/v1/products/${testProductId}`);
    if (testCategoryId) await del(`/api/v1/categories/${testCategoryId}`);
  });

  test('Debería crear un pedido con Mercado Pago y retornar initPoint (201)', async ({ request }) => {
    const res = await request.post('/api/v1/orders/checkout', {
      data: {
        customer: {
          name: 'Cliente Test',
          phone: '099123456',
          email: 'test@example.com',
        },
        items: [{ presentationId: testPresentationId, quantity: 1 }],
        paymentMethod: 'mercadopago', // SOLO MP
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    
    // El pedido debe nacer en 'pending'
    expect(body.data.order.status).toBe('pending');
    expect(body.data.order.paymentMethod).toBe('mercadopago');
    
    // Verificamos que Mercado Pago devolvió el link de pago
    expect(body.data.initPoint).toBeDefined();
    expect(body.data.initPoint).toContain('mercadopago');
    
    // Verificamos la reserva de stock
    const prodRes = await request.get(`/api/v1/products/${testProductId}`);
    const prodBody = await prodRes.json();
    const pres = prodBody.data.presentations.find((p: any) => p.id === testPresentationId);
    
    // El stock físico no baja (sigue en 10), pero el reservado sube a 1
    expect(pres.stock).toBe(10);
    expect(pres.stockReserved).toBe(1);
  });
});