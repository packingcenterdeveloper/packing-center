import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  HiBars3,
  HiOutlineShoppingCart,
  HiXMark,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserCircle,
  HiOutlineSquares2X2,
} from 'react-icons/hi2';
import { cn } from '@/lib/cn';
import { selectCartCount, useCartStore } from '@/stores/cart.store';
import { useCategories } from '@/hooks/queries/useCategories';
import { POPULAR_CATEGORY_SLUG } from '@/lib/constants';

interface NavItem {
  to: string;
  label: string;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio' },
  { to: '/mis-pedidos', label: 'Mis pedidos' },
  { to: '/carrito', label: 'Mi carrito' },
];

export function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const cartCount = useCartStore(selectCartCount);
  const location = useLocation();
  const { data: categories } = useCategories();

  const closeDrawer = () => setDrawerOpen(false);

  // Ocultamos el header en el checkout según el diseño
  const isCheckout = location.pathname.startsWith('/checkout');

  const navCategories = (categories ?? [])
    .filter((c) => c.slug !== POPULAR_CATEGORY_SLUG)
    .slice(0, 8);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 md:hidden',
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
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeDrawer}
          />
          <aside className="relative w-[85vw] max-w-[340px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            {/* Header del Drawer */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <Link
                to="/"
                onClick={closeDrawer}
                className="flex flex-col items-start leading-none"
              >
                <span className="text-lg font-extrabold tracking-tight text-brand">
                  PACKING
                </span>
                <span className="text-[9px] font-semibold tracking-[0.2em] text-slate-500 mt-1">
                  CENTER
                </span>
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-700"
                aria-label="Cerrar"
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto py-4">
              {/* Categorías */}
              <div className="px-5 mb-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <HiOutlineSquares2X2 className="w-3.5 h-3.5" />
                  Categorías
                </p>
                <nav className="flex flex-col">
                  {navCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/categorias/${cat.slug}`}
                      onClick={closeDrawer}
                      className="py-2 text-sm font-medium text-slate-700 hover:text-brand"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <Link
                    to="/categorias"
                    onClick={closeDrawer}
                    className="py-2 text-sm font-semibold text-brand"
                  >
                    Ver todas las categorías
                  </Link>
                </nav>
              </div>

              {/* Menú */}
              <div className="px-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <HiOutlineUserCircle className="w-3.5 h-3.5" />
                  Mi cuenta
                </p>
                <nav className="flex flex-col">
                  {MAIN_NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeDrawer}
                      className={({ isActive }) =>
                        cn(
                          'py-2 text-sm font-medium',
                          isActive ? 'text-brand' : 'text-slate-700 hover:text-brand',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>

            {/* Footer del Drawer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <a
                href="https://wa.me/59895301753" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-emerald-700"
              >
                <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                ¿Necesitás ayuda? Escribinos
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}