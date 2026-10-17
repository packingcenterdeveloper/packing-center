import { api } from '../client';
import type { ApiResponse, ProductImage } from '../types';

export interface CreateImageInput {
  url: string;
  publicId: string;
  alt?: string;
}

export interface UpdateImageInput {
  alt?: string | null;
  sortOrder?: number;
}

export async function adminCreateImage(
  productId: number,
  input: CreateImageInput,
): Promise<ProductImage> {
  const { data } = await api.post<ApiResponse<ProductImage>>(
    `/api/v1/products/${productId}/images`,
    input,
  );
  return data.data;
}

export async function adminUpdateImage(
  id: number,
  input: UpdateImageInput,
): Promise<ProductImage> {
  const { data } = await api.patch<ApiResponse<ProductImage>>(
    `/api/v1/images/${id}`,
    input,
  );
  return data.data;
}

export async function adminDeleteImage(id: number): Promise<void> {
  await api.delete(`/api/v1/images/${id}`);
}