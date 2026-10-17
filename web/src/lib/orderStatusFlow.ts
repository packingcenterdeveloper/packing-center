import type { OrderStatus } from '@/api/types';

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'preparing', 'cancelled'],
  paid: ['preparing', 'dispatched', 'cancelled'],
  preparing: ['dispatched', 'cancelled'],
  dispatched: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return ORDER_STATUS_FLOW[from]?.includes(to) ?? false;
}

/**
 * Devuelve el próximo estado lógico del flujo principal (ignora cancelled).
 * Útil para el botón "Avanzar al siguiente estado".
 */
export function nextStatus(from: OrderStatus): OrderStatus | null {
  const flow: OrderStatus[] = [
    'pending',
    'paid',
    'preparing',
    'dispatched',
    'delivered',
  ];
  const idx = flow.indexOf(from);
  if (idx === -1 || idx >= flow.length - 1) return null;
  return flow[idx + 1] ?? null;
}

export function isFinalStatus(status: OrderStatus): boolean {
  return status === 'delivered' || status === 'cancelled';
}