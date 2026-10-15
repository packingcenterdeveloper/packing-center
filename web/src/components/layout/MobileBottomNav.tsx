import { NavLink, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineSquares2X2,
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingCart,
  HiOutlineUser,
} from 'react-icons/hi2';
import type { IconType } from 'react-icons';
import { cn } from '@/lib/cn';
import {
  selectCartCount,
  useCartStore,
} from '@/stores/cart.store';

interface NavItem {
  to: string;
  label: string;
  icon: IconType;
  matchPrefix?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: HiOutlineHome },
  { to: '/categorias', label: 'Categorías', icon: HiOutlineSquares2X2, matchPrefix: true },
  { to: '/buscar', label: 'Buscar', icon: HiOutlineMagnifyingGlass, matchPrefix: true },
  { to: '/carrito', label: 'Carrito', icon: HiOutlineShoppingCart, matchPrefix: true },
  { to: '/mis-pedidos', label: 'Pedidos', icon: HiOutlineUser, matchPrefix: true },
];

export function MobileBottomNav() {
  const cartCount = useCartStore(selectCartCount);
  const location = useLocation();

  // No se muestra en checkout (según el diseño)
  const isCheckout = location.pathname.startsWith('/checkout');
  if (isCheckout) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 pb-safe">
      <div className="flex items-stretch justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isCart = item.to === '/carrito';

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={!item.matchPrefix}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 text-[10px] font-medium transition-colors',
                  isActive ? 'text-brand' : 'text-slate-500',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className="w-[22px] h-[22px]" />
                    {isCart && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-brand text-white text-[9px] font-bold">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span className="truncate max-w-full px-1">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}