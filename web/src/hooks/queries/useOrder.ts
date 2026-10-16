import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/api/orders';

export const orderKeys = {
  all: ['orders'] as const,
  detail: (id: string, phone: string) =>
    [...orderKeys.all, 'detail', id, phone] as const,
};

export function useOrder(id: string | undefined, phone: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? '', phone ?? ''),
    queryFn: () => getOrderById(id!, phone!),
    enabled: Boolean(id) && Boolean(phone),
  });
}