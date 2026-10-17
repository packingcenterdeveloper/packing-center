import { useQuery } from '@tanstack/react-query';
import { adminGetProduct } from '@/api/admin/products';
import { adminProductsKeys } from './useAdminProducts';

export function useAdminProduct(id: number | undefined) {
  return useQuery({
    queryKey: adminProductsKeys.detail(id ?? 0),
    queryFn: () => adminGetProduct(id!),
    enabled: Boolean(id),
  });
}