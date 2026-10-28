import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineShoppingCart,
  HiOutlineUser,
} from 'react-icons/hi2';
import { SearchInput } from '@/components/common/SearchInput';
import { selectCartCount, useCartStore } from '@/stores/cart.store';
import { useCategories } from '@/hooks/queries/useCategories';
import { POPULAR_CATEGORY_SLUG } from '@/lib/constants';

export function DesktopHeader() {
  const navigate = useNavigate();
  const cartCount = useCartStore(selectCartCount);
  const { data: categories } = useCategories();

  const navCategories = (categories ?? []).filter(
    (c) => c.slug !== POPULAR_CATEGORY_SLUG,
  ).slice(0, 6); // Mostramos solo las primeras 6 en el nav

  return (
    <header className="fixed top-0 left-0 right-0 z-50 hidden md:block bg-white border-b border-slate-200">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 text-center font-medium tracking-wide">
        Envíos a todo Uruguay &nbsp;·&nbsp; Comprá por unidad, paquete o bulto
      </div>

      {/* Main Header */}
      <div className="max-w-8xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-start shrink-0">
          <span className="text-xl font-extrabold tracking-tight text-brand leading-none">
            PACKING
          </span>
          <span className="text-[10px] font-bold tracking-[0.25em] text-slate-500 mt-1">
            CENTER
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <SearchInput
            placeholder="¿Qué producto estás buscando?"
            onSubmit={(q) => {
              if (!q) return;
              navigate(`/buscar?q=${encodeURIComponent(q)}`);
            }}
            className="h-12"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            to="/mis-pedidos"
            className="flex flex-col items-center gap-1 text-slate-600 hover:text-brand transition-colors"
          >
            <HiOutlineUser className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Mi pedido</span>
          </Link>
          <Link
            to="/carrito"
            className="flex flex-col items-center gap-1 text-slate-600 hover:text-brand transition-colors relative"
          >
            <div className="relative">
              <HiOutlineShoppingCart className="w-5 h-5 " />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-brand text-white text-[9px] font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold">Carrito</span>
          </Link>
        </div>
      </div>

      {/* Nav Bar */}
      <div className="border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-8xl mx-auto px-6 flex items-center gap-8 h-11">
          {navCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categorias/${cat.slug}`}
              className="textodelheaderPC text-xs font-semibold text-slate-600 hover:text-brand transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/categorias"
            className="text-xs font-semibold text-brand ml-auto"
          >
            Ver todas las categorías
          </Link>
        </div>
      </div>
    </header>
  );
}