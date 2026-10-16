// ============================================================
// Tipos que reflejan las respuestas del backend.
// Cambian solo si cambia el schema en el back.
// ============================================================

export type PresentationType = 'unidad' | 'paquete' | 'bulto' | 'caja';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type OrderPaymentMethod = 'mercadopago' | 'cash' | 'transfer';

// ------------------------------------------------------------
// Envelopes
// ------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ------------------------------------------------------------
// Categorías
// ------------------------------------------------------------

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------
// Productos
// ------------------------------------------------------------

export interface ProductImage {
  id: number;
  productId?: number;
  url: string;
  urlThumb: string;
  urlFull: string;
  publicId: string;
  alt: string | null;
  sortOrder: number;
}

export interface QuantityDiscount {
  id: number;
  productId: number;
  presentationId: number;
  minQuantity: number;
  percent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Presentation {
  id: number;
  productId: number;
  type: PresentationType;
  sku: string | null;
  priceCents: number;
  stock: number;
  stockReserved: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  quantityDiscounts?: QuantityDiscount[];
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  measures: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subcategory: string | null;
  images?: ProductImage[];
  presentations?: Presentation[];
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
}

// ------------------------------------------------------------
// Cupones
// ------------------------------------------------------------

export interface CouponAssignment {
  id: number;
  couponId: number;
  productId: number;
  presentationId: number;
  percent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: { id: number; name: string; slug: string };
  presentation?: {
    id: number;
    type: PresentationType;
    priceCents: number;
    isActive: boolean;
  };
}

export interface Coupon {
  id: number;
  code: string;
  description: string | null;
  maxUses: number | null;
  usedCount: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignments?: CouponAssignment[];
}

export interface ValidateCouponResult {
  valid: boolean;
  code: string;
  percent?: number;
  reason?: string;
}

// ------------------------------------------------------------
// Envío
// ------------------------------------------------------------

export interface ShippingDepartment {
  slug: string;
  name: string;
  isFree: boolean;
}

export interface ShippingConfig {
  departments: ShippingDepartment[];
  costLabel: string;
}

// ------------------------------------------------------------
// Carrito / cotización
// ------------------------------------------------------------

export interface QuoteItemInput {
  presentationId: number;
  quantity: number;
}

export interface QuoteBody {
  items: QuoteItemInput[];
  coupons?: string[];
  shippingDepartment?: string;
}

export interface QuoteItem {
  presentationId: number;
  productId: number;
  productName: string;
  productSlug: string;
  presentationType: PresentationType;
  unitPriceCents: number;
  quantity: number;
  lineSubtotalCents: number;
  quantityDiscountPercent: number | null;
  quantityDiscountCents: number;
  couponCode: string | null;
  couponPercent: number | null;
  couponDiscountCents: number;
  lineTotalCents: number;
}

export interface Quote {
  items: QuoteItem[];
  subtotalCents: number;
  quantityDiscountCents: number;
  couponDiscountCents: number;
  totalCents: number;
  shipping: {
    department: string | null;
    departmentName: string | null;
    isFree: boolean;
    label: string;
  };
  warnings: string[];
}

// ------------------------------------------------------------
// Pedidos
// ------------------------------------------------------------

export interface Order {
  id: string;
  orderNumber: string;

  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string | null;
  customerCity: string | null;
  customerNotes: string | null;

  shippingDepartment: string | null;
  shippingIsFree: boolean;
  shippingCostLabel: string | null;

  subtotalCents: number;
  discountCents: number;
  totalCents: number;

  status: OrderStatus;
  paymentMethod: OrderPaymentMethod | null;

  paidAt: string | null;
  seenByAdminAt: string | null;
  reservationExpiresAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: number | null;
  presentationId: number | null;
  productName: string;
  presentationType: PresentationType;
  unitPriceCents: number;
  quantity: number;
  quantityDiscountPercent: number | null;
  quantityDiscountCents: number;
  couponCode: string | null;
  couponDiscountPercent: number | null;
  couponDiscountCents: number;
  lineSubtotalCents: number;
  lineTotalCents: number;
  createdAt: string;
}

export interface OrderStatusHistory {
  id: number;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  changedBy: string;
  createdAt: string;
}

export interface OrderDetail {
  order: Order;
  items: OrderItem[];
  history: OrderStatusHistory[];
}

// ------------------------------------------------------------
// Auth
// ------------------------------------------------------------

export interface LoginResponse {
  token: string;
  expiresIn: string;
  email: string;
}

export interface MeResponse {
  email: string | null;
}

// ------------------------------------------------------------
// Dashboard admin
// ------------------------------------------------------------

export interface LowStockItem {
  presentationId: number;
  productId: number;
  productName: string;
  productSlug: string;
  type: PresentationType;
  stock: number;
  stockReserved: number;
  available: number;
}

export interface AdminDashboard {
  statusCounts: Record<OrderStatus, number>;
  unseenOrders: number;
  revenue: {
    today: number;
    month: number;
    allTime: number;
  };
  orders: {
    today: number;
    month: number;
  };
  latestOrders: Order[];
  lowStock: LowStockItem[];
}

// ------------------------------------------------------------
// Settings
// ------------------------------------------------------------

export type SettingKey =
  | 'MAIL_ADMIN_ENABLED'
  | 'MAIL_CLIENT_ENABLED'
  | 'MAIL_TO';

export interface SettingView {
  key: SettingKey;
  label: string;
  type: 'boolean' | 'email';
  value: string;
}

// ------------------------------------------------------------
// Uploads
// ------------------------------------------------------------

export interface UploadConfig {
  cloudName: string;
  uploadPreset: string;
  folder: string;
  maxBytes: number;
  acceptedFormats: string[];
}

// ------------------------------------------------------------
// Checkout
// ------------------------------------------------------------

export interface CheckoutCustomer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
}

export interface CheckoutBody {
  customer: CheckoutCustomer;
  items: QuoteItemInput[];
  coupons?: string[];
  shippingDepartment?: string;
  paymentMethod: OrderPaymentMethod;
}

export interface CheckoutResult {
  order: Order;
  items: OrderItem[];
  initPoint: string | null;
  paymentId: string | null;
}