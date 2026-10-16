import { NavLink } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  HiOutlineCog6Tooth,
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineSquares2X2,
  HiOutlineTicket,
  HiOutlineTruck,
} from 'react-icons/hi2';
import { cn } from '@/lib/cn';

interface AdminNavItem {
  to: string;
  label: string;
  description: string;
  icon: IconType;
  end?: boolean;
}

const NAV_ITEMS: AdminNavItem[] = [
  {
    to: '/admin',
    label: 'Inicio',
    description: 'Resumen del negocio',
    icon: HiOutlineHome,
    end: true,
  },
  {
    to: '/admin/pedidos',
    label: 'Pedidos',
    description: 'Ver y gestionar pedidos',
    icon: HiOutlineTruck,
  },
  {
    to: '/admin/productos',
    label: 'Productos',
    description: 'Catálogo, precios y stock',
    icon: HiOutlineShoppingBag,
  },
  {
    to: '/admin/categorias',
    label: 'Categorías',
    description: 'Organizar el catálogo',
    icon: HiOutlineSquares2X2,
  },
  {
    to: '/admin/cupones',
    label: 'Cupones',
    description: 'Descuentos con código',
    icon: HiOutlineTicket,
  },
  {
    to: '/admin/configuracion',
    label: 'Configuración',
    description: 'Mails y ajustes',
    icon: HiOutlineCog6Tooth,
  },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand'
                  : 'text-slate-700 hover:bg-slate-50',
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">
                {item.label}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                {item.description}
              </p>
            </div>
          </NavLink>
        );
      })}
    </nav>
  );
}