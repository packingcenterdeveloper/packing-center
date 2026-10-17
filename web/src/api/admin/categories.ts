import { api } from '../client';
import type { ApiResponse, Category } from '../types';

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export async function adminListCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiResponse<Category[]>>(
    '/api/v1/categories',
    { params: { includeInactive: 'true' } },
  );
  return data.data;
}

export async function adminCreateCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const { data } = await api.post<ApiResponse<Category>>(
    '/api/v1/categories',
    input,
  );
  return data.data;
}

export async function adminUpdateCategory(
  id: number,
  input: UpdateCategoryInput,
): Promise<Category> {
  const { data } = await api.patch<ApiResponse<Category>>(
    `/api/v1/categories/${id}`,
    input,
  );
  return data.data;
}

export async function adminDeleteCategory(id: number): Promise<void> {
  await api.delete(`/api/v1/categories/${id}`);
}