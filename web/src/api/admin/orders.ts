import { api } from '../client';
import type {
  ApiResponse,
  Order,
  OrderDetail,
  OrderStatus,
  PaginatedResponse,
} from '../types';

export interface AdminListOrdersParams {
  status?: OrderStatus;
  unseen?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export async function adminListOrders(
  params: AdminListOrdersParams = {},
): Promise<PaginatedResponse<Order>> {
  const { data } = await api.get<PaginatedResponse<Order>>(
    '/api/v1/admin/orders',
    {
      params: {
        status: params.status,
        unseen: params.unseen ? 'true' : undefined,
        search: params.search,
        page: params.page,
        limit: params.limit,
      },
    },
  );
  return data;
}

export async function adminGetOrder(id: string): Promise<OrderDetail> {
  const { data } = await api.get<ApiResponse<OrderDetail>>(
    `/api/v1/admin/orders/${id}`,
  );
  return data.data;
}

export async function adminUpdateOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string,
): Promise<Order> {
  const { data } = await api.patch<ApiResponse<Order>>(
    `/api/v1/admin/orders/${id}/status`,
    { status, note },
  );
  return data.data;
}

export async function adminMarkPaid(id: string): Promise<Order> {
  const { data } = await api.patch<ApiResponse<Order>>(
    `/api/v1/admin/orders/${id}/mark-paid`,
    {},
  );
  return data.data;
}

export async function adminCancelOrder(
  id: string,
  note?: string,
): Promise<Order> {
  const { data } = await api.patch<ApiResponse<Order>>(
    `/api/v1/admin/orders/${id}/cancel`,
    { note },
  );
  return data.data;
}

export async function adminDeleteOrder(id: string): Promise<void> {
  await api.delete(`/api/v1/admin/orders/${id}`);
}