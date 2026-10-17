import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminUpdateProduct,
  type CreateProductInput,
  type UpdateProductInput,
} from '@/api/admin/products';
import { adminProductsKeys } from '../queries/useAdminProducts';
import { productsKeys } from '../queries/useProducts';

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: adminProductsKeys.all });
    qc.invalidateQueries({ queryKey: productsKeys.all });
  };
}

export function useCreateProduct() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: CreateProductInput) => adminCreateProduct(input),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct(id: number) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: UpdateProductInput) => adminUpdateProduct(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => adminDeleteProduct(id),
    onSuccess: invalidate,
  });
}