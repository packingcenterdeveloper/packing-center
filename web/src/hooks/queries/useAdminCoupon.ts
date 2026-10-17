import { useQuery } from '@tanstack/react-query';
import { adminGetCoupon } from '@/api/admin/coupons';
import { adminCouponsKeys } from './useAdminCoupons';

export function useAdminCoupon(id: number | undefined) {
  return useQuery({
    queryKey: adminCouponsKeys.detail(id ?? 0),
    queryFn: () => adminGetCoupon(id!),
    enabled: Boolean(id),
  });
}