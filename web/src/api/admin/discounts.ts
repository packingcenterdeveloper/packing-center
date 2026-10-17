import { api } from '../client';
import type { ApiResponse, QuantityDiscount } from '../types';

export interface CreateDiscountInput {
  presentationId: number;
  minQuantity: number;
  percent: number;
  isActive?: boolean;
}

export interface UpdateDiscountInput {
  minQuantity?: number;
  percent?: number;
  isActive?: boolean;
}

export async function adminCreateDiscount(
  productId: number,
  input: CreateDiscountInput,
): Promise<QuantityDiscount> {
  const { data } = await api.post<ApiResponse<QuantityDiscount>>(
    `/api/v1/products/${productId}/discounts`,
    input,
  );
  return data.data;
}

export async function adminUpdateDiscount(
  id: number,
  input: UpdateDiscountInput,
): Promise<QuantityDiscount> {
  const { data } = await api.patch<ApiResponse<QuantityDiscount>>(
    `/api/v1/discounts/${id}`,
    input,
  );
  return data.data;
}

export async function adminDeleteDiscount(id: number): Promise<void> {
  await api.delete(`/api/v1/discounts/${id}`);
}