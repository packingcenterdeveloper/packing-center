import { useMutation } from '@tanstack/react-query';
import { checkout } from '@/api/orders';
import type { CheckoutBody } from '@/api/types';

export function useCheckout() {
  return useMutation({
    mutationFn: (body: CheckoutBody) => checkout(body),
  });
}