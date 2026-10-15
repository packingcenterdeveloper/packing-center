export const STORAGE_KEYS = {
  CART: 'P4ckingC3nterUY.cart',
  ADMIN_AUTH: 'packingcenter.admin.auth',
} as const;

export const FALLBACK_PRODUCT_IMAGE = 'https://i.postimg.cc/CxrNXwL0/Tubos.jpg';

export const POPULAR_CATEGORY_SLUG = 'populares';

export const ORDER_STATUSES = [
  'pending',
  'paid',
  'preparing',
  'dispatched',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  preparing: 'Preparando',
  dispatched: 'Despachado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<
OrderStatus,
{ bg: string; text: string }
> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-800' },
  paid: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  preparing: { bg: 'bg-blue-100', text: 'text-blue-800' },
  dispatched: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  delivered: { bg: 'bg-slate-100', text: 'text-slate-700' },
  cancelled: { bg: 'bg-rose-100', text: 'text-rose-800' },
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  cash: 'Efectivo',
  transfer: 'Transferencia',
};

export const PRESENTATION_TYPE_LABELS: Record<string, string> = {
  unidad: 'Unidad',
  paquete: 'Paquete',
  bulto: 'Bulto',
  caja: 'Caja',
};