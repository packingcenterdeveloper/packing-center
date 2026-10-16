import { useQuery } from '@tanstack/react-query';
import { getProductBySlug } from '@/api/products';
import { productsKeys } from './useProducts';

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: productsKeys.detail(slug ?? ''),
    queryFn: () => getProductBySlug(slug!),
    enabled: Boolean(slug),
  });
}