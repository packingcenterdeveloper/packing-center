import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <MobileHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}