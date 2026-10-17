import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCreatePresentation,
  adminDeletePresentation,
  adminUpdatePresentation,
  type CreatePresentationInput,
  type UpdatePresentationInput,
} from '@/api/admin/presentations';
import { adminProductsKeys } from '../queries/useAdminProducts';
import { productsKeys } from '../queries/useProducts';

function useInvalidate(productId: number) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({
      queryKey: adminProductsKeys.detail(productId),
    });
    qc.invalidateQueries({ queryKey: productsKeys.all });
  };
}

export function useCreatePresentation(productId: number) {
  const invalidate = useInvalidate(productId);
  return useMutation({
    mutationFn: (input: CreatePresentationInput) =>
      adminCreatePresentation(productId, input),
    onSuccess: invalidate,
  });
}

export function useUpdatePresentation(productId: number) {
  const invalidate = useInvalidate(productId);
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpdatePresentationInput;
    }) => adminUpdatePresentation(id, input),
    onSuccess: invalidate,
  });
}

export function useDeletePresentation(productId: number) {
  const invalidate = useInvalidate(productId);
  return useMutation({
    mutationFn: (id: number) => adminDeletePresentation(id),
    onSuccess: invalidate,
  });
}