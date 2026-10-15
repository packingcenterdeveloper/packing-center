import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';

export interface CartItem {
  presentationId: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  coupons: string[];
  shippingDepartment: string | null;

  add: (presentationId: number, quantity: number) => void;
  setQuantity: (presentationId: number, quantity: number) => void;
  remove: (presentationId: number) => void;
  clear: () => void;

  addCoupon: (code: string) => void;
  removeCoupon: (code: string) => void;
  setShippingDepartment: (slug: string | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupons: [],
      shippingDepartment: null,

      add: (presentationId, quantity) => {
        const items = get().items;
        const existing = items.find((i) => i.presentationId === presentationId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.presentationId === presentationId
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
          });
        } else {
          set({ items: [...items, { presentationId, quantity }] });
        }
      },

      setQuantity: (presentationId, quantity) => {
        if (quantity <= 0) {
          get().remove(presentationId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.presentationId === presentationId ? { ...i, quantity } : i,
          ),
        });
      },

      remove: (presentationId) =>
        set({
          items: get().items.filter(
            (i) => i.presentationId !== presentationId,
          ),
        }),

      clear: () => set({ items: [], coupons: [], shippingDepartment: null }),

      addCoupon: (code) => {
        const upper = code.trim().toUpperCase();
        if (!upper) return;
        const coupons = get().coupons;
        if (coupons.includes(upper)) return;
        set({ coupons: [...coupons, upper] });
      },

      removeCoupon: (code) =>
        set({ coupons: get().coupons.filter((c) => c !== code) }),

      setShippingDepartment: (slug) => set({ shippingDepartment: slug }),
    }),
    {
      name: STORAGE_KEYS.CART,
    },
  ),
);

/**
 * Selector para la cantidad total de unidades en el carrito.
 * Se usa para el badge del ícono de carrito.
 */
export function selectCartCount(state: CartState): number {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
}