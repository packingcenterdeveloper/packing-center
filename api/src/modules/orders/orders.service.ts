import { randomUUID } from 'node:crypto';
import type {
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusHistory,
} from '../../db/schema/index.js';
import {
  ConflictError,
  NotFoundError,
} from '../../shared/errors/httpErrors.js';
import { nextOrderNumber } from '../../shared/utils/orderNumber.js';
import * as cartService from '../cart/cart.service.js';
import * as inventory from '../inventory/inventory.service.js';
import * as paymentsService from '../payments/payments.service.js';
import * as repo from './orders.repository.js';
import type {
  AdminListOrdersQuery,
  CheckoutBody,
  UpdateStatusBody,
} from './orders.schemas.js';
import * as emailsService from '../emails/emails.service.js';

export interface CheckoutResult {
  order: Order;
  items: OrderItem[];
  initPoint: string | null;
  paymentId: string | null;
}

export async function checkout(input: CheckoutBody): Promise<CheckoutResult> {
  // 1. Recalcular todo server-side (nunca confiar en totales del front)
  const quote = await cartService.quote({
    items: input.items,
    coupons: input.coupons,
  });

  // 2. Crear pedido
  const orderId = randomUUID();
  const orderNumber = await nextOrderNumber();

  const shippingDept = quote.shipping.department;

  const order = await repo.create({
    id: orderId,
    orderNumber,
    customerName: input.customer.name,
    customerPhone: input.customer.phone,
    customerEmail: input.customer.email ?? null,
    customerAddress: input.customer.address ?? null,
    customerCity: input.customer.city ?? null,
    customerNotes: input.customer.notes ?? null,
    shippingDepartment: input.shippingDepartment ?? null,
    shippingIsFree: false,
    shippingCostLabel: 'Se cobra al retirar por DAC',
    subtotalCents: quote.subtotalCents,
    discountCents: quote.quantityDiscountCents + quote.couponDiscountCents,
    totalCents: quote.totalCents,
    status: 'pending',
    paymentMethod: input.paymentMethod,
  });

  // 3. Crear items
  const items = await repo.createItems(
    quote.items.map((item) => ({
      id: randomUUID(),
      orderId: order.id,
      productId: item.productId,
      presentationId: item.presentationId,
      productName: item.productName,
      presentationType: item.presentationType,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      quantityDiscountPercent: item.quantityDiscountPercent,
      quantityDiscountCents: item.quantityDiscountCents,
      couponCode: item.couponCode,
      couponDiscountPercent: item.couponPercent,
      couponDiscountCents: item.couponDiscountCents,
      lineSubtotalCents: item.lineSubtotalCents,
      lineTotalCents: item.lineTotalCents,
    })),
    );

  // 4. Reservar stock
  for (const item of quote.items) {
    await inventory.reserve({
      presentationId: item.presentationId,
      orderId: order.id,
      quantity: item.quantity,
      note: `Reserva pedido ${orderNumber}`,
    });
  }

  // 5. Historial inicial
  await repo.addStatusHistory({
    orderId: order.id,
    fromStatus: null,
    toStatus: 'pending',
    note: 'Pedido creado',
    changedBy: 'system',
  });

  // 6. Preferencia MP (solo si el método es MercadoPago)
  let initPoint: string | null = null;
  let paymentId: string | null = null;

  if (input.paymentMethod === 'mercadopago') {
    const preference = await paymentsService.createPreferenceForOrder({
      order,
      items,
    });
    initPoint = preference.initPoint;
    paymentId = preference.paymentId;
  }

  return { order, items, initPoint, paymentId };
}

export interface OrderDetail {
  order: Order;
  items: OrderItem[];
  history: OrderStatusHistory[];
}

export async function getByIdForCustomer(
  id: string,
  phone: string,
  ): Promise<OrderDetail> {
  const order = await repo.findById(id);
  if (!order) throw new NotFoundError(`Order ${id} not found`);
  if (order.customerPhone !== phone) {
    throw new NotFoundError(`Order ${id} not found`);
  }
  const [items, history] = await Promise.all([
    repo.findItems(id),
    repo.findHistory(id),
  ]);
  return { order, items, history };
}

export async function getByIdForAdmin(id: string): Promise<OrderDetail> {
  const order = await repo.findById(id);
  if (!order) throw new NotFoundError(`Order ${id} not found`);
  const [items, history] = await Promise.all([
    repo.findItems(id),
    repo.findHistory(id),
  ]);
  return { order, items, history };
}

export async function getByPhone(phone: string): Promise<Order[]> {
  return repo.findByPhone(phone);
}

export interface AdminListResult {
  items: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function listForAdmin(
  query: AdminListOrdersQuery,
  ): Promise<AdminListResult> {
  const { rows, total } = await repo.findAll({
    status: query.status,
    unseenOnly: query.unseen,
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

  return {
    items: rows,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function markSeen(id: string): Promise<Order> {
  const order = await repo.findById(id);
  if (!order) throw new NotFoundError(`Order ${id} not found`);
  if (order.seenByAdminAt) return order;
  const updated = await repo.update(id, { seenByAdminAt: new Date() });
  return updated!;
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'preparing', 'cancelled'],
  paid: ['preparing', 'dispatched', 'cancelled'],
  preparing: ['dispatched', 'cancelled'],
  dispatched: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export async function updateStatus(
  id: string,
  input: UpdateStatusBody,
  ): Promise<Order> {
  const order = await repo.findById(id);
  if (!order) throw new NotFoundError(`Order ${id} not found`);

  if (order.status === input.status) return order;

  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(input.status)) {
    throw new ConflictError(
  `Cannot transition from "${order.status}" to "${input.status}"`,
  );
  }

  // Transición a "paid" desde pending: consumir reserva
  if (input.status === 'paid' && order.status !== 'paid') {
    const items = await repo.findItems(id);
    for (const item of items) {
      if (item.presentationId) {
        await inventory.consumeReservation({
          presentationId: item.presentationId,
          orderId: order.id,
          quantity: item.quantity,
          note: `Pago confirmado pedido ${order.orderNumber}`,
        });
      }
    }
  }

  const updated = await repo.update(id, {
    status: input.status,
    paidAt: input.status === 'paid' ? new Date() : order.paidAt,
  });

  await repo.addStatusHistory({
    orderId: id,
    fromStatus: order.status,
    toStatus: input.status,
    note: input.note,
    changedBy: 'admin',
  });

    // Enviar mails al confirmar pago o cancelar.
  if (input.status === 'paid' || input.status === 'cancelled') {
    const items = await repo.findItems(id);
    emailsService
    .sendOrderEmails({ order: updated!, items })
    .catch((err) => {
        // No rompemos el flujo si fallan los mails.
      console.error('[orders] Error sending emails', err);
    });
  }

  return updated!;
}

export async function markPaid(id: string, note?: string): Promise<Order> {
  return updateStatus(id, { status: 'paid', note });
}

export async function cancel(id: string, note?: string): Promise<Order> {
  const order = await repo.findById(id);
  if (!order) throw new NotFoundError(`Order ${id} not found`);
  if (order.status === 'cancelled') return order;
  if (order.status === 'delivered') {
    throw new ConflictError('Cannot cancel a delivered order');
  }

  // Si estaba paid, restaurar stock; si estaba pending, liberar reserva
  const items = await repo.findItems(id);
  const wasPaid = order.status === 'paid';

  for (const item of items) {
    if (!item.presentationId) continue;
    if (wasPaid) {
      await inventory.restoreAfterSaleReversal({
        presentationId: item.presentationId,
        orderId: order.id,
        quantity: item.quantity,
        note: `Cancelación pedido ${order.orderNumber}`,
      });
    } else {
      await inventory.releaseReservation({
        presentationId: item.presentationId,
        orderId: order.id,
        quantity: item.quantity,
        note: `Cancelación pedido ${order.orderNumber}`,
      });
    }
  }

  const updated = await repo.update(id, { status: 'cancelled' });

  await repo.addStatusHistory({
    orderId: id,
    fromStatus: order.status,
    toStatus: 'cancelled',
    note: note ?? 'Cancelado por admin',
    changedBy: 'admin',
  });

  return updated!;
}

export async function remove(id: string): Promise<void> {
  const order = await repo.findById(id);
  if (!order) throw new NotFoundError(`Order ${id} not found`);
  if (order.status !== 'cancelled') {
    throw new ConflictError(
      'Only cancelled orders can be deleted. Cancel it first.',
      );
  }
  await repo.remove(id);
}

export interface DashboardStats {
  byStatus: Record<OrderStatus, number>;
  unseen: number;
}

export async function dashboardStats(): Promise<DashboardStats> {
  const [byStatus, unseen] = await Promise.all([
    repo.countByStatus(),
    repo.countUnseen(),
  ]);
  return { byStatus, unseen };
}