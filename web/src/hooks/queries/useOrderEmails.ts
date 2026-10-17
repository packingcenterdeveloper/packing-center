import { useQuery } from '@tanstack/react-query';
import { adminListOrderEmails } from '@/api/admin/emails';

export const orderEmailsKeys = {
  all: ['admin', 'emails'] as const,
  byOrder: (orderId: string) =>
    [...orderEmailsKeys.all, 'order', orderId] as const,
};

export function useOrderEmails(orderId: string | undefined) {
  return useQuery({
    queryKey: orderEmailsKeys.byOrder(orderId ?? ''),
    queryFn: () => adminListOrderEmails(orderId!),
    enabled: Boolean(orderId),
  });
}