import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  adminListProducts,
  type AdminListProductsParams,
} from '@/api/admin/products';

export const adminProductsKeys = {
  all: ['admin', 'products'] as const,
  list: (params: AdminListProductsParams) =>
    [...adminProductsKeys.all, 'list', params] as const,
  detail: (id: number) => [...adminProductsKeys.all, 'detail', id] as const,
};

export function useAdminProducts(params: AdminListProductsParams) {
  return useQuery({
    queryKey: adminProductsKeys.list(params),
    queryFn: () => adminListProducts(params),
    placeholderData: keepPreviousData,
  });
}