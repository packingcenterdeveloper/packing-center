import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiBars3,
  HiArrowRightOnRectangle,
  HiOutlineUserCircle,
  HiXMark,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { AdminSidebar } from './AdminSidebar';
import { useAuthStore } from '@/stores/auth.store';

export function AdminTopbar() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const email = useAuthStore((s) => s.email);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    toast.success('Cerraste sesión');
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-700"
              aria-label="Abrir menú"
            >
              <HiBars3 className="w-6 h-6" />
            </button>

            <div className="flex flex-col leading-none">
              <span className="text-sm font-extrabold tracking-tight text-brand">
                PACKING
              </span>
              <span className="text-[9px] font-semibold tracking-[0.2em] text-slate-500">
                CENTER · ADMIN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50">
              <HiOutlineUserCircle className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-600 max-w-[160px] truncate">
                {email}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 active:bg-slate-100"
            >
              <HiArrowRightOnRectangle className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200">
              <span className="font-bold text-slate-900">Menú</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 -mr-2 text-slate-700"
                aria-label="Cerrar"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}