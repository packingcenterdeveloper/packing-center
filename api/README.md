# PackingCenter — API

Backend del e-commerce de PackingCenter, empresa uruguaya de packaging
y descartables. Expone la API REST que consume el front (React + Vite,
carpeta `web/` del monorepo).

## Stack

- Node.js 18 LTS (último con soporte en Windows 8.1, entorno de
  desarrollo actual)
- TypeScript con `"type": "module"` (ESM, imports con extensión `.js`)
- Express 4
- Turso (SQLite cloud) vía `@libsql/client`
- Drizzle ORM
- Zod para validación
- JWT (`jsonwebtoken`) + `bcryptjs` para hashes
- Nodemailer (Gmail SMTP con contraseña de aplicación)
- Cloudinary para imágenes (upload directo desde el admin con preset
  unsigned)
- Mercado Pago (SDK oficial, CheckoutPRO)
- pino + pino-http para logs

## Estructura general
src/
├── config/ env, logger, turso, cloudinary, mercadoPago, mailer
├── db/
│ ├── schema/ Definición de tablas con Drizzle (una por archivo)
│ ├── migrations/ Migraciones generadas por drizzle-kit
│ └── seed.ts Datos iniciales idempotentes
├── modules/ Lógica de negocio, un módulo por dominio
├── middlewares/ auth, errorHandler, validate, asyncHandler, rateLimit
├── routes/ Router raíz que monta todos los módulos
├── shared/
│ ├── errors/ AppError + subclases (NotFoundError, ConflictError, etc.)
│ ├── utils/ slug, orderNumber, mpSignature, cloudinaryUrl
│ └── types/ Extiende el tipo Request de Express (req.admin, req.log)
├── scripts/ hashPassword, testAuth, e2e
├── app.ts Crea la Express app con middlewares globales
├── server.ts Arranca el HTTP server (dev / Node normal)
└── vercel.ts Entry point para serverless (exporta la app)

## Patrón de módulos

Cada módulo vive en `src/modules/<nombre>/` y sigue la misma estructura.
No todos los archivos existen en todos los módulos, según complejidad:

modules/products/
├── products.routes.ts Define endpoints, aplica middlewares, une a controller
├── products.controller.ts Parsea con Zod, llama al service, arma la respuesta
├── products.service.ts Lógica de negocio, lanza errores tipados
├── products.repository.ts Consultas a la DB con Drizzle
└── products.schemas.ts Validaciones Zod (body, params, query)


Reglas de la arquitectura:

- El controller nunca toca la base. Solo parsea con Zod, llama al
  service y arma la respuesta HTTP.
- El service nunca toca `req`/`res`. Solo lógica de negocio y errores
  tipados.
- El repository solo hace queries con Drizzle. Cero validación.
- Los tipos salen de Zod (`z.infer<typeof schema>`) o Drizzle
  (`typeof tabla.$inferSelect` / `$inferInsert`). No hay carpeta
  `types.ts` en módulos salvo que necesiten tipos propios que no
  vengan de esas dos fuentes.
- Los imports internos usan extensión `.js` aunque el archivo sea
  `.ts` (lo exige `module: NodeNext`).

## Módulos existentes

- **auth** — login admin (single call), emisión y verificación de JWT.
  No hay registro ni tabla `users`: el admin vive en env
  (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`).
- **categories** — CRUD de categorías.
- **products** — CRUD de productos. `GET /products/:slug` devuelve el
  producto enriquecido con imágenes, presentaciones, descuentos por
  cantidad y categoría, usando la API relacional de Drizzle.
- **presentations** — presentaciones por producto (unidad, paquete,
  bulto, caja). Maneja `stock` y `stockReserved`.
- **productImages** — imágenes de producto (con `publicId` de
  Cloudinary y `sortOrder`). Enriquece con `urlThumb`/`urlFull` que
  aplican transformaciones de Cloudinary para comprimir.
- **uploads** — expone la config de Cloudinary al admin
  (`cloudName`, `uploadPreset`, `folder`, límites).
- **quantityDiscounts** — reglas de descuento por cantidad por
  presentación: `(presentationId, minQuantity, percent)`.
- **coupons** — cupones con múltiples asignaciones. Modelo de dos
  tablas: `coupons` (código, vigencia, usos) y `coupon_assignments`
  (producto + presentación + porcentaje). Un mismo cupón puede
  aplicarse a varios productos del carrito a la vez.
- **cart** — cotización del carrito. `POST /cart/quote` recalcula
  todo server-side: subtotal, descuentos por cantidad, descuentos por
  cupón, total y datos de envío. Nunca persiste nada.
- **orders** — checkout, reserva de stock, historial de estados,
  cambio de estado, mark-paid, cancel, búsqueda por teléfono,
  listado admin, dashboard agregado.
- **payments** — creación de preferencia MP y webhook de confirmación.
  El webhook valida firma HMAC-SHA256 y es idempotente por
  `mp_payment_id`.
- **emails** — templates HTML y envío vía Nodemailer. Dos flags
  independientes: `MAIL_ADMIN_ENABLED` (mail al correo del proyecto)
  y `MAIL_CLIENT_ENABLED` (mail al cliente). Si están apagados, se
  registra el evento como `skipped` para poder reenviarlo después.
- **settings** — configuración runtime key/value en la DB. Los flags
  de mail viven acá y son modificables desde el panel sin reiniciar.
- **shipping** — array estático de departamentos de Uruguay con flag
  `isFree`. El envío no impacta en Mercado Pago: se muestra un label
  informativo "El envío por DAC se cobra al retirar".
- **inventory** — helper interno (no expuesto como endpoints) para
  reservar, liberar y consumir stock. Cada operación registra una
  fila en `inventory_movements` con estado antes/después.
- **admin** — dashboard agregado: contadores por estado, ventas del
  día / mes / total, últimos pedidos, productos con stock bajo.

## Flujo de compra end-to-end

1. Cliente arma carrito en el front. Cada cambio llama a
   `POST /cart/quote` con los ítems y cupones.

2. Cliente confirma con `POST /orders/checkout`. El service:
   - Recalcula el quote server-side (nunca confía en totales del
     front)
   - Crea el pedido en estado `pending`
   - Crea los `order_items` como snapshot (nombre, presentación,
     precio, descuentos aplicados)
   - Reserva stock con `inventory.reserve` (incrementa
     `stockReserved`)
   - Registra el historial inicial
   - Si `paymentMethod === 'mercadopago'`, crea preferencia MP y
     devuelve `init_point`

3. Mercado Pago redirige al cliente y luego notifica a
   `POST /payments/webhook`:
   - Valida firma con `verifyMpSignature`
   - Chequea idempotencia por `mp_payment_id` en `payments`
   - Consulta el pago real a MP (`Payment.get`)
   - Actualiza `payments` con el estado y payload
   - Actualiza el pedido:
     - `approved` → `paid` (llama a `orders.updateStatus`, que
       consume reserva y descuenta stock real)
     - `rejected` / `cancelled` → `cancelled` (libera reserva)
   - Dispara mails si los flags están activos

4. Admin ve el pedido en el panel, lo marca visto, lo pasa por los
   estados (`preparing` → `dispatched` → `delivered`) o lo cancela.
   `markPaid` está disponible para casos de efectivo/transferencia.

## Convenciones

- **Imports ESM con `.js`**: `import { env } from './config/env.js'`.
- **Errores tipados**: `NotFoundError`, `ConflictError`,
  `UnprocessableEntityError` de `shared/errors/httpErrors.ts`. El
  `errorHandler` global los convierte a JSON.
- **Formato de respuestas**:
  - Éxito: `{ data: ... }`, con `meta` extra para paginación.
  - Error: `{ error: { code, message, details? } }`.
- **Validación**: siempre con Zod en el controller, al inicio.
  Un `ZodError` se convierte en 400 automáticamente.
- **asyncHandler**: todos los handlers async van envueltos para que
  Express 4 atrape promesas rechazadas.
- **Auth**: rutas admin protegidas con `requireAdmin` (Bearer JWT).
  Rutas mixtas usan `optionalAdmin` para cambiar comportamiento según
  si hay token (`?includeInactive=true` requiere admin).
- **Precio en centavos**: `priceCents` y `totalCents` son enteros.
  Solo se convierten a decimales al hablar con Mercado Pago o al
  mostrar en el front.
- **Stock**: disponible = `stock - stockReserved`. Todo cambio pasa
  por `modules/inventory/inventory.service.ts` para dejar trazabilidad.
- **Idempotencia**: `payments.mp_payment_id` es único. El webhook no
  duplica nada si MP notifica varias veces.

## Modelo de datos

IDs numéricos en catálogo: `categories`, `products`,
`product_images`, `presentations`, `quantity_discounts`, `coupons`,
`coupon_assignments`, `settings`.

UUIDs (como TEXT) en pedidos y pagos: `orders`, `order_items`,
`payments`, `inventory_movements`, `email_events`. Los UUIDs van en
URLs públicas o se exponen en logs.

Tablas:

- `categories` — categorías
- `products` — productos con slug, descripción, medidas, categoría
- `product_images` — imágenes por producto (`url`, `publicId`, `sortOrder`)
- `presentations` — unidad/paquete/bulto/caja por producto, con
  `priceCents`, `stock`, `stockReserved`
- `quantity_discounts` — `(productId, presentationId, minQuantity, percent)`
- `coupons` — `code` único, vigencia, `maxUses`, `usedCount`
- `coupon_assignments` — `(couponId, productId, presentationId, percent)`
- `orders` — datos del cliente, envío, totales, estado, `paidAt`,
  `seenByAdminAt`
- `order_items` — snapshot con `productName`, `presentationType`,
  `unitPriceCents`, descuentos aplicados, `lineTotalCents`
- `order_status_history` — historial de cambios de estado con `fromStatus`,
  `toStatus`, `changedBy`
- `payments` — `mpPreferenceId`, `mpPaymentId` (unique), `mpStatus`,
  `rawPayload` (JSON)
- `inventory_movements` — auditoría con `stockBefore`/`After` y
  `stockReservedBefore`/`After`
- `email_events` — `type`, `toEmail`, `subject`, `status`
  (`pending`/`sent`/`failed`/`skipped`), `sentAt`
- `settings` — key/value simple, con upsert atómico

## Relaciones de Base de Datos y Reglas de Integridad

Para evitar errores en producción, es fundamental entender cómo se relacionan las tablas y qué ocurre cuando se intenta borrar un registro. El schema de Drizzle define las siguientes reglas de Foreign Key (`onDelete`):

### 1. Jerarquía del Catálogo
- **`categories` → `products` (Relación 1 a N)**: 
  - Regla: `onDelete: 'restrict'`. **No se puede borrar una categoría si tiene productos asignados.** Si se intenta, la base de datos lanzará un error. Primero hay que mover o borrar los productos.
- **`products` → `presentations` (1 a N)**: 
  - Regla: `onDelete: 'cascade'`. Si se borra un producto, **se borran automáticamente todas sus presentaciones**.
- **`products` → `product_images` (1 a N)**: 
  - Regla: `onDelete: 'cascade'`. Al borrar un producto, sus imágenes se eliminan de la base de datos (y el backend se encarga de borrarlas de Cloudinary).
- **`presentations` → `quantity_discounts` (1 a N)**: 
  - Regla: `onDelete: 'cascade'`. Al borrar una presentación, sus reglas de descuento por cantidad desaparecen.

### 2. Cupones y Asignaciones
- **`coupons` → `coupon_assignments` (1 a N)**: 
  - Regla: `onDelete: 'cascade'`. Si se borra el cupón, se borran todas sus asignaciones (a qué productos aplica).
- **`coupon_assignments` → `products` y `presentations`**: 
  - Regla: `onDelete: 'cascade'`. Si se borra un producto o una presentación, la asignación de cupón también desaparece para evitar datos huérfanos.

### 3. El Núcleo de Pedidos (Inmutabilidad Histórica)
- **`orders` → `order_items` (1 a N)**: 
  - Regla: `onDelete: 'cascade'`. Si se borra un pedido, sus ítems se borran.
- **`order_items` → `products` y `presentations`**: 
  - Regla: `onDelete: 'set null'`. **¡CRÍTICO!** Los ítems del pedido guardan una "foto" (snapshot) del nombre, precio y presentación en el momento de la compra. Si un producto se borra del catálogo, el pedido histórico **NO se rompe**; simplemente el `productId` queda en `null`, pero el nombre y precio guardados en `order_items` se mantienen intactos para la contabilidad.
- **`orders` → `payments`, `order_status_history`, `inventory_movements`, `email_events` (1 a N)**: 
  - Regla: `onDelete: 'cascade'` para pagos e historial, y `set null` para movimientos de inventario y mails (para mantener la auditoría incluso si el pedido se borra).

### 4. Inventario y Stock
- **`presentations` → `inventory_movements` (1 a N)**:
  - Regla: `onDelete: 'cascade'`. Cada vez que se reserva, vende o libera stock, se crea un registro en `inventory_movements`. Si se borra la presentación, su historial de movimientos se borra.
  - **Fórmula de Stock**: El stock real disponible para la venta **nunca** es solo la columna `stock`. Siempre es `stock - stockReserved`. El campo `stockReserved` se incrementa cuando un pedido entra en estado `pending` y se libera (o se descuenta del `stock` real) cuando el pedido pasa a `paid` o `cancelled`.

### 5. Configuración
- **`settings`**: Es una tabla aislada de tipo Key/Value. No tiene relaciones con otras tablas. Los flags de mail (`MAIL_ADMIN_ENABLED`, `MAIL_CLIENT_ENABLED`) viven acá para poder cambiarlos en runtime sin reiniciar el servidor.

## Rutas principales

Públicas:
- `GET /health`
- `POST /auth/login`
- `GET /categories`, `GET /categories/:slug`
- `GET /products`, `GET /products/:slug`
- `GET /products/:productId/presentations`
- `GET /products/:productId/images`
- `GET /products/:productId/discounts`
- `GET /coupons/validate?code=X&presentationId=Y`
- `POST /cart/quote`
- `GET /shipping/departments`
- `POST /orders/checkout`
- `GET /orders/:id?phone=X` (verifica teléfono)
- `GET /orders/by-phone/:phone`
- `POST /payments/webhook` (firma MP)

Admin (Bearer JWT):
- CRUD de `categories`, `products`, `presentations`,
  `productImages`, `quantityDiscounts`, `coupons` y sus asignaciones
- `GET /admin/orders` (filtros, paginación, unseen)
- `GET /admin/orders/:id` (marca como visto)
- `PATCH /admin/orders/:id/status`
- `PATCH /admin/orders/:id/mark-paid`
- `PATCH /admin/orders/:id/cancel`
- `DELETE /admin/orders/:id` (solo cancelados)
- `GET /admin/dashboard`
- `GET /admin/settings`, `PATCH /admin/settings`
- `GET /uploads/config`
- `GET /emails/orders/:orderId`, `POST /emails/orders/:orderId/resend`

## Variables de entorno

Ver `.env.example`. Imprescindibles: Turso, JWT, Cloudinary, MP. Las
de mail son opcionales si los flags están apagados.

`MAIL_ENABLED` (env) ya no se usa. Ahora son dos flags independientes
gestionados desde la tabla `settings` y modificables desde el panel:
`MAIL_ADMIN_ENABLED` y `MAIL_CLIENT_ENABLED`.

## Comandos
pnpm dev # tsx watch src/server.ts
pnpm build # tsc
pnpm start # node dist/server.js
pnpm typecheck # tsc --noEmit
pnpm db:generate # drizzle-kit generate
pnpm db:push # drizzle-kit push
pnpm db:studio # drizzle-kit studio
pnpm db:seed # tsx src/db/seed.ts
pnpm hash:password # genera hash bcrypt para ADMIN_PASSWORD_HASH
pnpm auth:test # login + /me contra el server local
pnpm e2e # flujo end-to-end completo


## Deploy a Vercel

- Entry point serverless: `src/vercel.ts` exporta la app de Express
  como default. `vercel.json` está configurado para usar
  `dist/vercel.js` como handler.
- Root directory del proyecto en Vercel debe ser `api/`.
- `buildCommand` es `pnpm build` (tsc). Vercel corre el build y usa
  `dist/vercel.js`.
- Variables de entorno se cargan en el panel de Vercel.
- El webhook de MP requiere URL pública: en producción es
  `https://api.tudominio.com/api/v1/payments/webhook`; en desarrollo
  se usa ngrok o cloudflared apuntando a `localhost:3001`.

## Consideraciones de escalado

- Los mails se envían en modo fire-and-forget desde el webhook. En
  Vercel serverless, la función puede congelarse antes de que termine
  el envío. Migrar a un patrón outbox con worker (Vercel Cron u otro)
  si el volumen lo requiere.
- El contador de `orderNumber` usa `UPDATE ... RETURNING` sobre
  `settings`. Es atómico y funciona bien, pero si el tráfico crece
  mucho, mover a una tabla dedicada con secuencia.
- La reserva de stock no es transaccional con el insert del pedido.
  Con alta concurrencia, envolver en `db.transaction`. Hoy no es
  necesario y evita problemas de conexión remota con libsql.
- El rate limit está en memoria. En Vercel serverless cada instancia
  tiene su propio contador. Migrar a Upstash Redis si hace falta
  rate limit global.

## Notas

- Todo el código está en español e inglés: identificadores
  en inglés, comentarios y mensajes de error en español.
- Los mensajes al usuario final son en español.
- Las respuestas del backend usan `data` para éxito y `error` para
  fallos. No hay otros formatos.
- El front todavía no existe. Cuando se arme, va a consumir esta API
  desde `web/` con Axios y guardar el JWT del admin en `localStorage`
  bajo una clave específica (a definir).