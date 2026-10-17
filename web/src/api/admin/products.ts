import { api } from '../client';
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
} from '../types';

export interface AdminListProductsParams {
  categorySlug?: string;
  subcategory?: string;
  search?: string;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
}

export async function adminListProducts(
  params: AdminListProductsParams = {},
): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>(
    '/api/v1/products',
    {
      params: {
        category: params.categorySlug,
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

export async function adminGetProduct(id: number): Promise<Product> {
  const { data } = await api.get<ApiResponse<Product>>(
    `/api/v1/admin/products/${id}`,
  );
  return data.data;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  categoryId: number;
  subcategory?: string | null;
  description?: string;
  measures?: string;
  isActive?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export async function adminCreateProduct(
  input: CreateProductInput,
): Promise<Product> {
  const { data } = await api.post<ApiResponse<Product>>(
    '/api/v1/products',
    input,
  );
  return data.data;
}

export async function adminUpdateProduct(
  id: number,
  input: UpdateProductInput,
): Promise<Product> {
  const { data } = await api.patch<ApiResponse<Product>>(
    `/api/v1/products/${id}`,
    input,
  );
  return data.data;
}

export async function adminDeleteProduct(id: number): Promise<void> {
  await api.delete(`/api/v1/products/${id}`);
}