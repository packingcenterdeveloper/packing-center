import { api } from './client';
import type { ApiResponse, Category } from './types';

export async function listCategories(params?: {
  includeInactive?: boolean;
}): Promise<Category[]> {
  const { data } = await api.get<ApiResponse<Category[]>>('/api/v1/categories', {
    params: params?.includeInactive ? { includeInactive: 'true' } : undefined,
  });
  return data.data;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data } = await api.get<ApiResponse<Category>>(
    `/api/v1/categories/${slug}`,
  );
  return data.data;
}