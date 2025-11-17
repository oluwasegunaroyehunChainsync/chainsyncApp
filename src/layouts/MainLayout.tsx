import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/stores';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import NotificationCenter from '@/components/NotificationCenter';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuthStore();
  const [location] = useLocation();

  const isAuthPage = location === '/login' || location === '/signup';

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
      <Sidebar />
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
