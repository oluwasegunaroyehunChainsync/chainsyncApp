import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/stores';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useUIStore } from '@/stores/uiStore';
import NotificationCenter from '@/components/NotificationCenter';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuthStore();
  const [location] = useLocation();

  const isAuthPage = location === '/login' || location === '/signup';

  const isMobileSidebarOpen = useUIStore((s) => s.isMobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);

  // Close on Escape and disable body scroll when open (subscribe to store)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false);
    };
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen, setMobileSidebarOpen]);

  if (!isAuthenticated || isAuthPage) {
    return (
      <>
        {children}
        <NotificationCenter />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
      <NotificationCenter />
    </div>
  );
}
