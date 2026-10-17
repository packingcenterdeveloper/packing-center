import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminResendOrderEmails } from '@/api/admin/emails';
import { orderEmailsKeys } from '../queries/useOrderEmails';

export function useResendOrderEmails(orderId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => adminResendOrderEmails(orderId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: orderEmailsKeys.byOrder(orderId),
      });
    },
  });
}