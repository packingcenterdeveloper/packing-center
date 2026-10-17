import { useQuery } from '@tanstack/react-query';
import { adminListCoupons } from '@/api/admin/coupons';

export const adminCouponsKeys = {
  all: ['admin', 'coupons'] as const,
  list: () => [...adminCouponsKeys.all, 'list'] as const,
  detail: (id: number) => [...adminCouponsKeys.all, 'detail', id] as const,
};

export function useAdminCoupons() {
  return useQuery({
    queryKey: adminCouponsKeys.list(),
    queryFn: () => adminListCoupons(true),
  });
}