import { api } from './client';
import type { ApiResponse, Quote, QuoteBody } from './types';

export async function quote(body: QuoteBody): Promise<Quote> {
  const { data } = await api.post<ApiResponse<Quote>>(
    '/api/v1/cart/quote',
    body,
  );
  return data.data;
}