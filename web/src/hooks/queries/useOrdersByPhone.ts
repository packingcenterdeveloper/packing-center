import { useQuery } from '@tanstack/react-query';
import { getOrdersByPhone } from '@/api/orders';
import { normalizePhone } from '@/lib/format';

export function useOrdersByPhone(phone: string | null) {
  const normalized = phone ? normalizePhone(phone) : '';
  const enabled = normalized.length >= 8;

  return useQuery({
    queryKey: ['orders', 'by-phone', normalized],
    queryFn: () => getOrdersByPhone(normalized),
    enabled,
  });
}