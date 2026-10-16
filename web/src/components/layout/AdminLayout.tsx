import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminTopbar />

      <div className="flex">
        <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-3.5rem)]">
          <AdminSidebar />
        </aside>

        <main className="flex-1 min-w-0 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}