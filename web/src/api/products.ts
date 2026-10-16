import { api } from './client';
import type { ApiResponse, PaginatedResponse, Product } from './types';

export interface ListProductsParams {
  category?: string;
  subcategory?: string;
  search?: string;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>(
    '/api/v1/products',
    {
      params: {
        category: params.category,
        subcategory: params.subcategory,
        search: params.search,
        includeInactive: params.includeInactive ? 'true' : undefined,
        page: params.page,
        limit: params.limit,
      },
    },
  );
  return data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await api.get<ApiResponse<Product>>(
    `/api/v1/products/${slug}`,
  );
  return data.data;
}