import { api } from './client';
import type {
  ApiResponse,
  CheckoutBody,
  CheckoutResult,
  Order,
  OrderDetail,
} from './types';

export async function checkout(body: CheckoutBody): Promise<CheckoutResult> {
  const { data } = await api.post<ApiResponse<CheckoutResult>>(
    '/api/v1/orders/checkout',
    body,
    );
  return data.data;
}

export async function getOrderById(
  id: string,
  phone: string,
  ): Promise<OrderDetail> {
  const { data } = await api.get<ApiResponse<OrderDetail>>(
`/api/v1/orders/${id}`,
{ params: { phone } },
);
  return data.data;
}

export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  const { data } = await api.get<ApiResponse<Order[]>>(
`/api/v1/orders/by-phone/${encodeURIComponent(phone)}`,
);
  return data.data;
}