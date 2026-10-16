import { useQuery } from '@tanstack/react-query';
import { listSubcategories } from '@/api/categories';

export const subcategoriesKeys = {
  all: ['subcategories'] as const,
  byCategory: (slug: string) =>
    [...subcategoriesKeys.all, slug] as const,
};

export function useSubcategories(categorySlug: string | undefined) {
  return useQuery({
    queryKey: subcategoriesKeys.byCategory(categorySlug ?? ''),
    queryFn: () => listSubcategories(categorySlug!),
    enabled: Boolean(categorySlug),
  });
}