import { test, expect } from '@playwright/test';

const TEST_ADMIN_EMAIL = 'packingcenterdeveloper@gmail.com';
const TEST_ADMIN_PASSWORD = 'p4ckingCenterDeVel0p3r';

test.describe('POST /auth/login', () => {

  // --- CASO FELIZ ---
  test('1. Debería hacer login exitoso con credenciales válidas', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveProperty('token');
    expect(typeof body.data.token).toBe('string');
    expect(body.data.email).toBe(TEST_ADMIN_EMAIL);
  });

  // --- ERRORES DE NEGOCIO (401) ---
  test('2. Debería fallar con un email válido pero no registrado', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: 'noexiste@example.com', // Formato válido, pero no es el admin
        password: TEST_ADMIN_PASSWORD,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error.message).toContain('Invalid email or password');
  });

  test('3. Debería fallar con contraseña incorrecta', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: TEST_ADMIN_EMAIL,
        password: 'contrasenaIncorrecta123',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error.message).toContain('Invalid email or password');
  });

  // --- ERRORES DE VALIDACIÓN ZOD (400) ---
  test('4. Debería fallar si falta el email', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: { password: TEST_ADMIN_PASSWORD },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('5. Debería fallar si falta la contraseña', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: { email: TEST_ADMIN_EMAIL },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('6. Debería fallar con email de formato inválido', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: 'esto-no-es-un-email',
        password: TEST_ADMIN_PASSWORD,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('7. Debería fallar con contraseña extremadamente larga', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: TEST_ADMIN_EMAIL,
        password: 'a'.repeat(500), // Zod tiene un max(200)
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  // --- SEGURIDAD (SQL INJECTION) ---
  test('8. Debería fallar con intento de SQL Injection en el email', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: "admin' OR 1=1 --",
        password: TEST_ADMIN_PASSWORD,
      },
    });

    // Zod lo frena antes de llegar a la base de datos por formato inválido
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  // --- ROBUSTEZ (TRIM Y MAYÚSCULAS) ---
  test('9. Debería hacer login exitoso con espacios antes y después del email', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: `   ${TEST_ADMIN_EMAIL}   `, // Con espacios
        password: TEST_ADMIN_PASSWORD,
      },
    });

    // Zod usa .trim() así que debería limpiar y funcionar
    expect(response.status()).toBe(200);
  });

  test('10. Debería hacer login exitoso con el email en mayúsculas', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: TEST_ADMIN_EMAIL.toUpperCase(), // MAYÚSCULAS
        password: TEST_ADMIN_PASSWORD,
      },
    });

    // El backend hace toLowerCase() así que debería funcionar
    expect(response.status()).toBe(200);
  });

});