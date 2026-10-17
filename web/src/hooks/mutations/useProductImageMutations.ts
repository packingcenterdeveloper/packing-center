import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateImage,
  adminDeleteImage,
  adminUpdateImage,
  type CreateImageInput,
  type UpdateImageInput,
} from '@/api/admin/images';
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

export function useCreateImage(productId: number) {
  const invalidate = useInvalidate(productId);
  return useMutation({
    mutationFn: (input: CreateImageInput) =>
      adminCreateImage(productId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateImage(productId: number) {
  const invalidate = useInvalidate(productId);
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateImageInput }) =>
      adminUpdateImage(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteImage(productId: number) {
  const invalidate = useInvalidate(productId);
  return useMutation({
    mutationFn: (id: number) => adminDeleteImage(id),
    onSuccess: invalidate,
  });
}