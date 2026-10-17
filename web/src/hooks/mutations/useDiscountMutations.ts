import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateDiscount,
  adminDeleteDiscount,
  adminUpdateDiscount,
  type CreateDiscountInput,
  type UpdateDiscountInput,
} from '@/api/admin/discounts';
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

export function useCreateDiscount(productId: number) {
  const invalidate = useInvalidate(productId);
  return useMutation({
    mutationFn: (input: CreateDiscountInput) =>
      adminCreateDiscount(productId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateDiscount(productId: number) {
  const invalidate = useInvalidate(productId);
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpdateDiscountInput;
    }) => adminUpdateDiscount(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteDiscount(productId: number) {
  const invalidate = useInvalidate(productId);
  return useMutation({
    mutationFn: (id: number) => adminDeleteDiscount(id),
    onSuccess: invalidate,
  });
}