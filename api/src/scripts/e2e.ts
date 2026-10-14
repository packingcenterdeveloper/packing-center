import { env } from '../config/env.js';

const BASE = env.API_URL;
const T = Date.now().toString().slice(-8);
const SLUG = `e2e-${T}`;

interface ApiResult<T = unknown> {
	status: number;
	data: T;
}

async function api<T = unknown>(
	method: string,
	path: string,
	opts: { body?: unknown; token?: string } = {},
	): Promise<ApiResult<T>> {
	const headers: Record<string, string> = {};
	if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
	if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

	const res = await fetch(`${BASE}${path}`, {
		method,
		headers,
		body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
	});

	const text = await res.text();
	const data = text ? (JSON.parse(text) as T) : (null as T);
	return { status: res.status, data };
}

function assert(
	condition: unknown,
	message: string,
	): asserts condition {
	if (!condition) {
		throw new Error(`ASSERT FAILED: ${message}`);
	}
}

function step(name: string): void {
	console.log(`\n▶ ${name}`);
}

function ok(message: string): void {
	console.log(`  ✓ ${message}`);
}

async function main(): Promise<void> {
	console.log(`\n[e2e] PackingCenter · base=${BASE}\n`);

  // --- 1. Auth ---
	step('Login admin');
	const password = process.argv[2];
	assert(password, 'Uso: pnpm e2e "<admin-password>"');

	const login = await api<{ data: { token: string } }>(
		'POST',
		'/api/v1/auth/login',
		{ body: { email: env.ADMIN_EMAIL, password } },
		);
	assert(login.status === 200, `Login falló (${login.status})`);
	const token = login.data.data.token;
	ok('Token obtenido');

  // --- 2. Crear categoría ---
	step('Crear categoría');
	const catRes = await api<{ data: { id: number; slug: string } }>(
		'POST',
		'/api/v1/categories',
		{
			token,
			body: { name: `Cat e2e ${T}`, description: 'Categoría de prueba' },
		},
		);
	assert(catRes.status === 201, `Create category falló (${catRes.status})`);
	const categoryId = catRes.data.data.id;
	ok(`Categoría creada: id=${categoryId}, slug=${catRes.data.data.slug}`);

  // --- 3. Crear producto ---
	step('Crear producto');
	const prodRes = await api<{
		data: { id: number; slug: string; name: string };
	}>('POST', '/api/v1/products', {
		token,
		body: {
			name: `Producto e2e ${T}`,
			categoryId,
			description: 'Producto de prueba e2e',
			measures: '10x10x10 cm',
		},
	});
	assert(prodRes.status === 201, `Create product falló (${prodRes.status})`);
	const productId = prodRes.data.data.id;
	const productSlug = prodRes.data.data.slug;
	ok(`Producto creado: id=${productId}, slug=${productSlug}`);

  // --- 4. Crear presentaciones ---
	step('Crear presentaciones');
	const presUnidad = await api<{ data: { id: number } }>(
		'POST',
	`/api/v1/products/${productId}/presentations`,
	{
		token,
		body: { type: 'unidad', priceCents: 1000, stock: 500, sku: `E2E-UNI-${T}` },
	},
	);
	assert(presUnidad.status === 201, `Pres unidad falló (${presUnidad.status})`);
	const presUnidadId = presUnidad.data.data.id;
	ok(`Unidad: id=${presUnidadId}, precio=1000c, stock=500`);

	const presCaja = await api<{ data: { id: number } }>(
		'POST',
	`/api/v1/products/${productId}/presentations`,
	{
		token,
		body: { type: 'caja', priceCents: 80000, stock: 20, sku: `E2E-CAJ-${T}` },
	},
	);
	assert(presCaja.status === 201, `Pres caja falló (${presCaja.status})`);
	const presCajaId = presCaja.data.data.id;
	ok(`Caja: id=${presCajaId}, precio=80000c, stock=20`);

  // --- 5. Descuento por cantidad ---
	step('Crear descuento por cantidad (caja, desde 5, 10%)');
	const discRes = await api(
		'POST',
	`/api/v1/products/${productId}/discounts`,
	{
		token,
		body: { presentationId: presCajaId, minQuantity: 5, percent: 10 },
	},
	);
	assert(discRes.status === 201, `Create discount falló (${discRes.status})`);
	ok('Descuento creado');

  // --- 6. Cupón con asignación ---
	step('Crear cupón + asignación (unidad, 15%)');
	const couponRes = await api<{ data: { id: number } }>(
		'POST',
		'/api/v1/coupons',
		{ token, body: { code: `E2E${T}`, description: 'Cupón e2e' } },
		);
	assert(couponRes.status === 201, `Create coupon falló (${couponRes.status})`);
	const couponId = couponRes.data.data.id;
	const couponCode = `E2E${T}`;

	const assignmentRes = await api(
		'POST',
	`/api/v1/coupons/${couponId}/assignments`,
	{
		token,
		body: { productId, presentationId: presUnidadId, percent: 15 },
	},
	);
	assert(
		assignmentRes.status === 201,
	`Create assignment falló (${assignmentRes.status})`,
	);
	ok(`Cupón ${couponCode} creado y asignado`);

  // --- 7. Quote simple ---
	step('Quote simple: 2 unidades');
	const q1 = await api<{
		data: { totalCents: number; subtotalCents: number };
	}>('POST', '/api/v1/cart/quote', {
		body: { items: [{ presentationId: presUnidadId, quantity: 2 }] },
	});
	assert(q1.status === 200, `Quote simple falló (${q1.status})`);
	assert(q1.data.data.subtotalCents === 2000, 'Subtotal 2 unidades ≠ 2000');
	assert(q1.data.data.totalCents === 2000, 'Total 2 unidades ≠ 2000');
	ok('Subtotal = 2000c, Total = 2000c');

  // --- 8. Quote con descuento por cantidad ---
	step('Quote con descuento: 5 cajas (10% off)');
	const q2 = await api<{
		data: {
			subtotalCents: number;
			quantityDiscountCents: number;
			totalCents: number;
		};
	}>('POST', '/api/v1/cart/quote', {
		body: { items: [{ presentationId: presCajaId, quantity: 5 }] },
	});
	assert(q2.status === 200, `Quote caja falló (${q2.status})`);
	assert(q2.data.data.subtotalCents === 400000, 'Subtotal 5 cajas ≠ 400000');
	assert(
		q2.data.data.quantityDiscountCents === 40000,
		'Descuento cantidad ≠ 40000',
		);
	assert(q2.data.data.totalCents === 360000, 'Total 5 cajas ≠ 360000');
	ok('Subtotal = 400000c, Desc = 40000c, Total = 360000c');

  // --- 9. Quote con cupón ---
	step(`Quote con cupón ${couponCode} (unidad, 15%)`);
	const q3 = await api<{
		data: {
			subtotalCents: number;
			couponDiscountCents: number;
			totalCents: number;
			warnings: string[];
		};
	}>('POST', '/api/v1/cart/quote', {
		body: {
			items: [{ presentationId: presUnidadId, quantity: 100 }],
			coupons: [couponCode],
		},
	});
	assert(q3.status === 200, `Quote cupón falló (${q3.status})`);
	assert(q3.data.data.subtotalCents === 100000, 'Subtotal 100 unid ≠ 100000');
	assert(
		q3.data.data.couponDiscountCents === 15000,
		'Descuento cupón ≠ 15000',
		);
	assert(q3.data.data.totalCents === 85000, 'Total con cupón ≠ 85000');
	ok('Subtotal = 100000c, Cupón = 15000c, Total = 85000c');

  // --- 10. Checkout (efectivo) ---
	step('Checkout con método "cash"');
	const checkout = await api<{
		data: { order: { id: string; orderNumber: string; status: string } };
	}>('POST', '/api/v1/orders/checkout', {
		body: {
			customer: {
				name: 'Cliente E2E',
				phone: `099${T}`,
				email: `e2e-${T}@example.com`,
			},
			items: [
				{ presentationId: presUnidadId, quantity: 10 },
				{ presentationId: presCajaId, quantity: 3 },
			],
			coupons: [],
			paymentMethod: 'cash',
		},
	});
	assert(checkout.status === 201, `Checkout falló (${checkout.status})`);
	const orderId = checkout.data.data.order.id;
	const orderNumber = checkout.data.data.order.orderNumber;
	ok(`Pedido ${orderNumber} creado (id=${orderId})`);

  // --- 11. Verificar stock reservado ---
	step('Verificar stock reservado post-checkout');
	const afterCheckout = await api<{
		data: {
			presentations: Array<{
				id: number;
				stock: number;
				stockReserved: number;
			}>;
		};
	}>('GET', `/api/v1/products/${productSlug}`, { token });
	assert(afterCheckout.status === 200, 'Fetch producto falló');

	const unidadState = afterCheckout.data.data.presentations.find(
		(p) => p.id === presUnidadId,
		);
	assert(unidadState, 'Presentación unidad no encontrada');
	assert(
		unidadState.stock === 500 && unidadState.stockReserved === 10,
	`Unidad stock=${unidadState.stock}, reserved=${unidadState.stockReserved} (esperado 500/10)`,
	);

	const cajaState = afterCheckout.data.data.presentations.find(
		(p) => p.id === presCajaId,
		);
	assert(cajaState, 'Presentación caja no encontrada');
	assert(
		cajaState.stock === 20 && cajaState.stockReserved === 3,
	`Caja stock=${cajaState.stock}, reserved=${cajaState.stockReserved} (esperado 20/3)`,
	);
	ok('Reservas correctas: unidad +10, caja +3');

  // --- 12. Admin marca pagado ---
	step('Admin marca pedido como pagado');
	const markPaid = await api<{ data: { status: string } }>(
		'PATCH',
	`/api/v1/admin/orders/${orderId}/mark-paid`,
	{ token, body: {} },
	);
	assert(markPaid.status === 200, `Mark paid falló (${markPaid.status})`);
	assert(markPaid.data.data.status === 'paid', 'Estado ≠ paid');
	ok('Pedido pagado');

  // --- 13. Verificar stock consumido ---
	step('Verificar stock consumido (stock baja, reserva se libera)');
	const afterPaid = await api<{
		data: {
			presentations: Array<{
				id: number;
				stock: number;
				stockReserved: number;
			}>;
		};
	}>('GET', `/api/v1/products/${productSlug}`, { token });

	const unidadAfter = afterPaid.data.data.presentations.find(
		(p) => p.id === presUnidadId,
		);
	assert(unidadAfter, 'Unidad no encontrada post-paid');
	assert(
		unidadAfter.stock === 490 && unidadAfter.stockReserved === 0,
	`Unidad post-paid stock=${unidadAfter.stock}, reserved=${unidadAfter.stockReserved} (esperado 490/0)`,
	);

	const cajaAfter = afterPaid.data.data.presentations.find(
		(p) => p.id === presCajaId,
		);
	assert(cajaAfter, 'Caja no encontrada post-paid');
	assert(
		cajaAfter.stock === 17 && cajaAfter.stockReserved === 0,
	`Caja post-paid stock=${cajaAfter.stock}, reserved=${cajaAfter.stockReserved} (esperado 17/0)`,
	);
	ok('Stock descontado y reservas liberadas');

  // --- 14. Email events ---
	step('Verificar email_events (mails deshabilitados → status skipped)');
	const emails = await api<{
		data: Array<{ type: string; status: string }>;
	}>('GET', `/api/v1/emails/orders/${orderId}`, { token });
	assert(emails.status === 200, `List emails falló (${emails.status})`);
	const statuses = emails.data.data.map((e) => `${e.type}:${e.status}`).join(', ');
	ok(`Eventos: ${statuses || 'ninguno'}`);
  // Nota: si MAIL_CLIENT_ENABLED=false y MAIL_ADMIN_ENABLED=false, ambos quedan skipped.

  // --- 15. Dashboard ---
	step('Verificar dashboard');
	const dash = await api<{
		data: {
			statusCounts: Record<string, number>;
			revenue: { allTime: number };
			latestOrders: Array<{ id: string }>;
		};
	}>('GET', '/api/v1/admin/dashboard', { token });
	assert(dash.status === 200, `Dashboard falló (${dash.status})`);
	assert((dash.data.data.statusCounts.paid ?? 0) >= 1, 'Dashboard no cuenta el paid');
	assert(
		dash.data.data.latestOrders.some((o) => o.id === orderId),
		'Pedido e2e no aparece en latestOrders',
		);
	ok(`Paid count=${dash.data.data.statusCounts.paid}, revenue allTime=${dash.data.data.revenue.allTime}c`);

  // --- 16. Cleanup ---
	step('Cleanup');
	const cancel = await api(
		'PATCH',
	`/api/v1/admin/orders/${orderId}/cancel`,
	{ token, body: {} },
	);
	assert(cancel.status === 200, `Cancel falló (${cancel.status})`);
	const del = await api(
		'DELETE',
	`/api/v1/admin/orders/${orderId}`,
	{ token },
	);
	assert(del.status === 204, `Delete order falló (${del.status})`);
	ok('Pedido cancelado y borrado');

  // Borrar presentaciones (hijas del producto)
	const delPresUnidad = await api(
		'DELETE',
	`/api/v1/presentations/${presUnidadId}`,
	{ token },
	);
	assert(
		delPresUnidad.status === 204,
	`Delete presentación unidad falló (${delPresUnidad.status})`,
	);
	const delPresCaja = await api(
		'DELETE',
	`/api/v1/presentations/${presCajaId}`,
	{ token },
	);
	assert(
		delPresCaja.status === 204,
	`Delete presentación caja falló (${delPresCaja.status})`,
	);
	ok('Presentaciones borradas');

  // Borrar producto (ya sin presentaciones)
	const delProduct = await api(
		'DELETE',
	`/api/v1/products/${productId}`,
	{ token },
	);
	assert(
		delProduct.status === 204,
	`Delete product falló (${delProduct.status})`,
	);
	ok('Producto borrado');

  // Borrar cupón (borra asignaciones en cascada)
	const delCoupon = await api(
		'DELETE',
	`/api/v1/coupons/${couponId}`,
	{ token },
	);
	assert(
		delCoupon.status === 204,
	`Delete coupon falló (${delCoupon.status})`,
	);
	ok('Cupón borrado');

  // Borrar categoría
	const delCategory = await api(
		'DELETE',
	`/api/v1/categories/${categoryId}`,
	{ token },
	);
	assert(
		delCategory.status === 204,
	`Delete category falló (${delCategory.status})`,
	);
	ok('Categoría borrada');

	console.log('\n[e2e] Todos los pasos pasaron ✓\n');
}

main()
.then(() => process.exit(0))
.catch((err) => {
	console.error('\n[e2e] FALLÓ:', err instanceof Error ? err.message : err);
	process.exit(1);
});