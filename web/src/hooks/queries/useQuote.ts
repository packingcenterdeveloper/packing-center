import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { quote } from '@/api/cart';
import { useCartStore } from '@/stores/cart.store';

export function useQuote() {
  const items = useCartStore((s) => s.items);
  const coupons = useCartStore((s) => s.coupons);

  return useQuery({
    queryKey: ['cart', 'quote', items, coupons],
    queryFn: () => quote({ items, coupons }),
    enabled: items.length > 0,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}