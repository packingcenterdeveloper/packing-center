import { useQuery } from '@tanstack/react-query';
import { getCategoryBySlug } from '@/api/categories';
import { categoriesKeys } from './useCategories';

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: [...categoriesKeys.all, 'detail', slug ?? ''],
    queryFn: () => getCategoryBySlug(slug!),
    enabled: Boolean(slug),
  });
}