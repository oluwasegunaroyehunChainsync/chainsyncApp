import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/transfer', label: 'Transfer', icon: '🔄' },
  { href: '/validators', label: 'Validators', icon: '✓' },
  { href: '/governance', label: 'Governance', icon: '🗳️' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
    >
      <div className="p-6 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && <h2 className="text-lg font-bold text-gray-900">Menu</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-200">
        <div className={`${isCollapsed ? 'hidden' : 'block'} text-xs text-gray-500 text-center`}>
          ChainSync v1.0
        </div>
      </div>
    </aside>
  );
}
