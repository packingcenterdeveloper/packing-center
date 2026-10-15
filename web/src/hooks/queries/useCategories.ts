import { useQuery } from '@tanstack/react-query';
import { listCategories } from '@/api/categories';

export const categoriesKeys = {
  all: ['categories'] as const,
  list: (includeInactive: boolean) =>
    [...categoriesKeys.all, { includeInactive }] as const,
};

export function useCategories(options?: { includeInactive?: boolean }) {
  const includeInactive = options?.includeInactive ?? false;

  return useQuery({
    queryKey: categoriesKeys.list(includeInactive),
    queryFn: () => listCategories({ includeInactive }),
    staleTime: 5 * 60 * 1000, // 5 minutos, las categorías cambian poco
  });
}