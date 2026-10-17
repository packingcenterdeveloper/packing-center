import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  adminListOrders,
  type AdminListOrdersParams,
} from '@/api/admin/orders';

export const adminOrdersKeys = {
  all: ['admin', 'orders'] as const,
  list: (params: AdminListOrdersParams) =>
    [...adminOrdersKeys.all, 'list', params] as const,
  detail: (id: string) => [...adminOrdersKeys.all, 'detail', id] as const,
};

export function useAdminOrders(params: AdminListOrdersParams) {
  return useQuery({
    queryKey: adminOrdersKeys.list(params),
    queryFn: () => adminListOrders(params),
    placeholderData: keepPreviousData,
  });
}