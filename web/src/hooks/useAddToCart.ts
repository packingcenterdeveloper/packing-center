import { toast } from 'react-hot-toast';
import { useCartStore } from '@/stores/cart.store';

export function useAddToCart() {
  const add = useCartStore((s) => s.add);

  return function addToCart(
    presentationId: number,
    quantity: number,
    productName: string,
  ) {
    add(presentationId, quantity);
    toast.success(`${productName} agregado al carrito`);
  };
}