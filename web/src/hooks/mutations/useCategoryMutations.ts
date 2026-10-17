import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminUpdateCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/api/admin/categories';
import { adminCategoriesKeys } from '../queries/useAdminCategories';
import { categoriesKeys } from '../queries/useCategories';

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: adminCategoriesKeys.all });
    qc.invalidateQueries({ queryKey: categoriesKeys.all });
  };
}

export function useCreateCategory() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => adminCreateCategory(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpdateCategoryInput;
    }) => adminUpdateCategory(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => adminDeleteCategory(id),
    onSuccess: invalidate,
  });
}