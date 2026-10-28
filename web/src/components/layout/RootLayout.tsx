import { Outlet, ScrollRestoration } from 'react-router-dom';
import { DesktopHeader } from './DesktopHeader';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 md:pt-36 pt-14">
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <DesktopHeader />

      <main className="flex-1 w-full max-w-8xl mx-auto md:px-6 md:py-6">
        <Outlet />
      </main>

      <Footer />

      <div className="md:hidden">
        <MobileBottomNav />
      </div>
      <ScrollRestoration />
    </div>
  );
}