import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCancelOrder,
  adminDeleteOrder,
  adminMarkPaid,
  adminUpdateOrderStatus,
} from '@/api/admin/orders';
import { adminOrdersKeys } from '../queries/useAdminOrders';
import type { OrderStatus } from '@/api/types';

function useInvalidateOrder(id: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: adminOrdersKeys.all });
    qc.invalidateQueries({ queryKey: adminOrdersKeys.detail(id) });
  };
}

export function useUpdateOrderStatus(id: string) {
  const invalidate = useInvalidateOrder(id);

  return useMutation({
    mutationFn: (input: { status: OrderStatus; note?: string }) =>
      adminUpdateOrderStatus(id, input.status, input.note),
    onSuccess: invalidate,
  });
}

export function useMarkPaid(id: string) {
  const invalidate = useInvalidateOrder(id);

  return useMutation({
    mutationFn: () => adminMarkPaid(id),
    onSuccess: invalidate,
  });
}

export function useCancelOrder(id: string) {
  const invalidate = useInvalidateOrder(id);

  return useMutation({
    mutationFn: (note?: string) => adminCancelOrder(id, note),
    onSuccess: invalidate,
  });
}

export function useDeleteOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminDeleteOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminOrdersKeys.all });
    },
  });
}