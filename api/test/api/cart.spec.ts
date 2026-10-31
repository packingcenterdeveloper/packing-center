import { test, expect } from '@playwright/test';
import { testData } from '../fixtures/testData';

const TEST_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

let adminToken: string;

test.describe('POST /cart/quote', () => {

  // 1. ANTES DE TODOS LOS TESTS: Login y creación de datos
  test.beforeAll(async ({ request }) => {
    // Login para obtener el token
    const loginRes = await request.post('/api/v1/auth/login', {
      data: { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD },
    });
    const loginBody = await loginRes.json();
    adminToken = loginBody.data.token;

    // Crear categoría
    const catRes = await request.post('/api/v1/categories', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: `Cat Test ${Date.now()}`, slug: `cat-test-${Date.now()}` },
    });
    const catBody = await catRes.json();
    testData.categoryId = catBody.data.id;

    // Crear producto
    const prodRes = await request.post('/api/v1/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: `Producto Test Carrito ${Date.now()}`,
        categoryId: testData.categoryId,
        isActive: true,
      },
    });
    const prodBody = await prodRes.json();
    testData.productId = prodBody.data.id;

    // Crear presentación Unidad (precio 100 = $1, stock 50)
    const presUniRes = await request.post(`/api/v1/products/${testData.productId}/presentations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { type: 'unidad', priceCents: 10000, stock: 50 }, // $100
    });
    const presUniBody = await presUniRes.json();
    testData.presentationUnidadId = presUniBody.data.id;

    // Crear presentación Caja (precio 800 = $800, stock 10)
    const presCajaRes = await request.post(`/api/v1/products/${testData.productId}/presentations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { type: 'caja', priceCents: 80000, stock: 10 }, // $800
    });
    const presCajaBody = await presCajaRes.json();
    testData.presentationCajaId = presCajaBody.data.id;

    // Crear regla de descuento: 5 unidades o más = 10% off
    await request.post(`/api/v1/products/${testData.productId}/discounts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { presentationId: testData.presentationUnidadId, minQuantity: 5, percent: 10 },
    });

    // Crear cupón
    const couponRes = await request.post('/api/v1/coupons', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { code: testData.couponCode, description: 'Test Coupon' },
    });
    const couponBody = await couponRes.json();
    testData.couponId = couponBody.data.id;

    // Asignar cupón solo a la presentación Unidad (15% off)
    await request.post(`/api/v1/coupons/${testData.couponId}/assignments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { productId: testData.productId, presentationId: testData.presentationUnidadId, percent: 15 },
    });
  });

  // 2. DESPUÉS DE TODOS LOS TESTS: Limpieza
  test.afterAll(async ({ request }) => {
    // Pausa de 1 segundo para que Turso procese las operaciones anteriores
    await new Promise(resolve => setTimeout(resolve, 1000));

    const deleteSafe = async (url: string) => {
      try {
        await request.delete(url, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        // Pequeña pausa entre cada borrado
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.warn(`[Limpieza] No se pudo borrar ${url}:`, error);
      }
    };

    // Borramos en orden inverso
    await deleteSafe(`/api/v1/coupons/${testData.couponId}`);
    await deleteSafe(`/api/v1/presentations/${testData.presentationUnidadId}`);
    await deleteSafe(`/api/v1/presentations/${testData.presentationCajaId}`);
    await deleteSafe(`/api/v1/products/${testData.productId}`);
    await deleteSafe(`/api/v1/categories/${testData.categoryId}`);
  });
  // --- CASOS DE PRUEBA ---

  test('1. Cotización simple (1 unidad, sin descuentos)', async ({ request }) => {
    const res = await request.post('/api/v1/cart/quote', {
      data: { items: [{ presentationId: testData.presentationUnidadId, quantity: 1 }] },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.subtotalCents).toBe(10000);
    expect(body.data.totalCents).toBe(10000);
  });

  test('2. Cotización con descuento por cantidad (5 unidades = 10%)', async ({ request }) => {
    const res = await request.post('/api/v1/cart/quote', {
      data: { items: [{ presentationId: testData.presentationUnidadId, quantity: 5 }] },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    // Subtotal: 50000. Descuento 10%: 5000. Total: 45000.
    expect(body.data.subtotalCents).toBe(50000);
    expect(body.data.quantityDiscountCents).toBe(5000);
    expect(body.data.totalCents).toBe(45000);
  });

  test('3. Cotización con cupón aplicable (1 unidad + cupón 15%)', async ({ request }) => {
    const res = await request.post('/api/v1/cart/quote', {
      data: {
        items: [{ presentationId: testData.presentationUnidadId, quantity: 1 }],
        coupons: [testData.couponCode],
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    // Subtotal: 10000. Cupón 15%: 1500. Total: 8500.
    expect(body.data.couponDiscountCents).toBe(1500);
    expect(body.data.totalCents).toBe(8500);
  });

  test('4. Cupón cruzado (intentar usar cupón de Unidad en Caja)', async ({ request }) => {
    const res = await request.post('/api/v1/cart/quote', {
      data: {
        items: [{ presentationId: testData.presentationCajaId, quantity: 1 }], // Presentación Caja
        coupons: [testData.couponCode], // Cupón de Unidad
      },
    });
    expect(res.status()).toBe(200); // No falla, solo ignora el cupón
    const body = await res.json();
    expect(body.data.couponDiscountCents).toBe(0); // Descuento 0
    expect(body.data.totalCents).toBe(80000); // Precio completo
    expect(body.data.warnings).toContainEqual(expect.stringContaining('no aplica a ningún producto'));
  });

  test('5. Precio irrisorio (Verificar que no quede en 0 por error)', async ({ request }) => {
    // Esta prueba es un poco trampa, pero sirve para asegurar que el backend
    // nunca devuelve un total negativo o 0 si el cálculo es correcto.
    const res = await request.post('/api/v1/cart/quote', {
      data: { items: [{ presentationId: testData.presentationUnidadId, quantity: 1 }] },
    });
    const body = await res.json();
    expect(body.data.totalCents).toBeGreaterThan(0);
  });

  test('6. Stock insuficiente (pedir 999 cajas)', async ({ request }) => {
    const res = await request.post('/api/v1/cart/quote', {
      data: { items: [{ presentationId: testData.presentationCajaId, quantity: 999 }] },
    });
    expect(res.status()).toBe(409); // Conflict
  });

  test('7. Carrito vacío', async ({ request }) => {
    const res = await request.post('/api/v1/cart/quote', {
      data: { items: [] },
    });
    expect(res.status()).toBe(400); // Zod
  });
});