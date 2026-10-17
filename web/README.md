# PackingCenter — Frontend

SPA (Single Page Application) que consume la API del backend. Diseñada mobile-first.

## Stack

- React 18 + TypeScript
- Vite (bundler)
- React Router v6 (rutas)
- TanStack Query v5 (estado del servidor, caché)
- Zustand (estado del cliente)
- Axios (peticiones HTTP)
- Tailwind CSS (estilos)
- React Hook Form + Zod (formularios)
- React Icons (íconos)
- html-to-image (descarga de pedidos como PNG)

## Estructura de carpetas
src/
├── api/ Llamadas puras al backend (Axios)
├── components/ Componentes de UI, divididos por dominio
├── hooks/ Queries y mutations de TanStack Query
├── lib/ Utilidades (format, whatsapp, download, slugs, etc.)
├── pages/ Vistas de la aplicación
├── router.tsx Configuración de rutas (React Router)
├── stores/ Stores de Zustand (carrito, auth)
└── types/ Tipos compartidos


## Flujos principales

### Tienda (pública)
- `/` — Home con hero, categorías, populares, testimonios, FAQ.
- `/categorias` — Todas las categorías.
- `/categorias/:slug` — Productos de una categoría con filtros.
- `/productos/:slug` — Ficha del producto, selector de presentaciones y cantidades.
- `/carrito` — Carrito persistido en localStorage.
- `/checkout` — Formulario de envío y pago.
- `/pedido/:id` — Confirmación de pedido.
- `/mis-pedidos` — Búsqueda por teléfono.
- `/mis-pedidos/:id` — Seguimiento del pedido.

### Panel Admin
- `/admin/login` — Login con JWT guardado en localStorage.
- `/admin` — Dashboard con métricas.
- `/admin/pedidos` — Tabla de pedidos con filtros.
- `/admin/pedidos/:id` — Gestión del pedido, estados, mails y descarga.
- `/admin/productos` — CRUD de productos.
- `/admin/productos/:id` — Edición de info, imágenes, presentaciones y descuentos.
- `/admin/categorias` — CRUD de categorías.
- `/admin/cupones` — CRUD de cupones y asignaciones.
- `/admin/configuracion` — Ajustes de envío de mails.

## Manejo del estado

- **TanStack Query** maneja todo lo que viene del servidor.
  - Las queries usan `staleTime: 1h` por defecto (en `main.tsx`).
  - Las mutaciones invalidan las queries correspondientes al terminar con éxito.
- **Zustand** maneja el estado local que debe sobrevivir recargas.
  - `cart.store.ts`: items, cupones aplicados. Persistido en localStorage (`packingcenter.cart`).
  - `auth.store.ts`: JWT del admin, email. Persistido en localStorage (`packingcenter.admin.auth`).

## Autenticación

El token JWT viaja en el header `Authorization: Bearer <token>`.
El interceptor de Axios (`api/client.ts`) lo inyecta automáticamente.
Si el back responde 401 en una ruta `/admin/*`, el interceptor limpia el store y redirige a `/admin/login`.

## Decisiones clave

- **Formularios**: todos usan `React Hook Form` + `Zod`. Los esquemas con `coerce.number()` usan los genéricos `<Input, Context, Output>` en `useForm` para que RHF no chille por la diferencia entre el tipo de entrada (string) y el de salida (number).
- **Subida de imágenes**: directo a Cloudinary con `unsigned preset`. Las imágenes se comprimen en el navegador con `browser-image-compression` antes de subirse.
- **Descarga de pedidos**: se usa `html-to-image` para renderizar un componente oculto (`OrderPrintView`) en un PNG que se descarga.
- **Protección de rutas**: `<ProtectedRoute>` en `components/auth/` envuelve a todo el layout de admin.
- **Notificaciones**: `react-hot-toast` para todos los avisos de éxito o error.
- **Responsive**: Tailwind con enfoque mobile-first. Sin bottom-nav en el admin (usa un drawer lateral).

## Comandos

pnpm dev          # Arranca el servidor de Vite en localhost:5173
pnpm build        # Compila a producción (crea /dist)
pnpm typecheck    # Verifica tipos con tsc
pnpm preview      # Sirve el build localmente

## Notas de integración

El manejo de envíos es 100% visual en el front. El backend solo guarda el string de la localidad y no interviene en el cálculo del total.

El carrito se arma con presentationId, no con productId.

Antes de enviar el pago a MP, se llama a POST /cart/quote para recalcular totales con el servidor.