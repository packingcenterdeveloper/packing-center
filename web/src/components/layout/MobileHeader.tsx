import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  HiBars3,
  HiOutlineShoppingCart,
  HiXMark,
} from 'react-icons/hi2';
import { cn } from '@/lib/cn';
import {
  selectCartCount,
  useCartStore,
} from '@/stores/cart.store';

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio' },
  { to: '/categorias', label: 'Categorías' },
  { to: '/buscar', label: 'Buscar' },
  { to: '/mis-pedidos', label: 'Mis pedidos' },
];

export function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const cartCount = useCartStore(selectCartCount);
  const location = useLocation();

  // Cierra el drawer al navegar
  const closeDrawer = () => setDrawerOpen(false);

  // El header no se muestra en checkout (según el diseño)
  const isCheckout = location.pathname.startsWith('/checkout');

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 bg-white border-b border-slate-200',
          isCheckout && 'hidden',
        )}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 text-slate-700"
            aria-label="Abrir menú"
          >
            <HiBars3 className="w-6 h-6" />
          </button>

          <Link
            to="/"
            className="flex flex-col items-center leading-none"
            aria-label="PackingCenter - Inicio"
          >
            <span className="text-[15px] font-extrabold tracking-tight text-brand">
              PACKING
            </span>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
              CENTER
            </span>
          </Link>

          <Link
            to="/carrito"
            className="relative p-2 -mr-2 text-slate-700"
            aria-label="Ver carrito"
          >
            <HiOutlineShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-bold">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Drawer lateral */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={closeDrawer}
          />
          <aside className="relative w-72 max-w-[80vw] h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200">
              <span className="font-bold text-slate-900">Menú</span>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 -mr-2 text-slate-700"
                aria-label="Cerrar"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col p-2">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand'
                        : 'text-slate-700 hover:bg-slate-50',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}