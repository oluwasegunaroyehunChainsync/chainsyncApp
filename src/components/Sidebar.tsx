import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useUIStore } from '@/stores/uiStore';

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/transfer', label: 'Transfer', icon: '🔄' },
  { href: '/validators', label: 'Validators', icon: '✓' },
  { href: '/governance', label: 'Governance', icon: '🗳️' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fallback to global UI store if props are not provided
  const storeIsOpen = useUIStore((s) => s.isMobileSidebarOpen);
  const storeSetOpen = useUIStore((s) => s.setMobileSidebarOpen);

  const open = typeof isOpen === 'boolean' ? isOpen : storeIsOpen;
  const close = onClose ?? (() => storeSetOpen(false));

  const AsideContent = (
    <aside
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col h-full`}
    >
      <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* mobile close button inside aside */}
          {close && (
            <button
              onClick={close}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors md:hidden"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10 3.636 5.05l1.414-1.414L10 8.586z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => close && close()}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className={`${isCollapsed ? 'hidden' : 'block'} text-xs text-gray-500 dark:text-gray-400 text-center`}>
          ChainSync v1.0
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar (visible from md up) */}
      <div className="hidden md:flex flex-shrink-0">{AsideContent}</div>

      {/* Mobile overlay sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={close}
        />

        {/* Slide-in panel */}
        <div className={`absolute left-0 top-0 h-full ${open ? 'translate-x-0' : '-translate-x-full'} transform transition-transform duration-300`}>
          <div className="h-full w-[min(85vw,20rem)] md:w-64 bg-white dark:bg-gray-800 shadow-xl">
            {AsideContent}
          </div>
        </div>
      </div>
    </>
  );
}
