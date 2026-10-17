import { useQuery } from '@tanstack/react-query';
import { adminGetOrder } from '@/api/admin/orders';
import { adminOrdersKeys } from './useAdminOrders';

export function useAdminOrder(id: string | undefined) {
  return useQuery({
    queryKey: adminOrdersKeys.detail(id ?? ''),
    queryFn: () => adminGetOrder(id!),
    enabled: Boolean(id),
  });
}