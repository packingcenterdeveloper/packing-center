import { Outlet } from 'react-router-dom';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <MobileHeader />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
}