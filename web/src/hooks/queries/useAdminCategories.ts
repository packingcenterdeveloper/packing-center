import { useQuery } from '@tanstack/react-query';
import { adminListCategories } from '@/api/admin/categories';

export const adminCategoriesKeys = {
  all: ['admin', 'categories'] as const,
};

export function useAdminCategories() {
  return useQuery({
    queryKey: adminCategoriesKeys.all,
    queryFn: adminListCategories,
  });
}