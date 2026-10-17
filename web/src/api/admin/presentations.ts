import { api } from '../client';
import type { ApiResponse, Presentation, PresentationType } from '../types';

export interface CreatePresentationInput {
  type: PresentationType;
  sku?: string;
  priceCents: number;
  stock: number;
  isActive?: boolean;
}

export interface UpdatePresentationInput {
  sku?: string | null;
  priceCents?: number;
  stock?: number;
  isActive?: boolean;
}

export async function adminCreatePresentation(
  productId: number,
  input: CreatePresentationInput,
  ): Promise<Presentation> {
  const { data } = await api.post<ApiResponse<Presentation>>(
`/api/v1/products/${productId}/presentations`,
input,
);
  return data.data;
}

export async function adminUpdatePresentation(
  id: number,
  input: UpdatePresentationInput,
  ): Promise<Presentation> {
  const { data } = await api.patch<ApiResponse<Presentation>>(
`/api/v1/presentations/${id}`,
input,
);
  return data.data;
}

export async function adminDeletePresentation(id: number): Promise<void> {
  await api.delete(`/api/v1/presentations/${id}`);
}