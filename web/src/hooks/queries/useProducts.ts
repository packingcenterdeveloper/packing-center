import { useQuery } from '@tanstack/react-query';
import { listProducts, type ListProductsParams } from '@/api/products';

export const productsKeys = {
  all: ['products'] as const,
  list: (params: ListProductsParams) =>
    [...productsKeys.all, 'list', params] as const,
  detail: (slug: string) => [...productsKeys.all, 'detail', slug] as const,
};

export function useProducts(params: ListProductsParams = {}) {
  return useQuery({
    queryKey: productsKeys.list(params),
    queryFn: () => listProducts(params),
  });
}