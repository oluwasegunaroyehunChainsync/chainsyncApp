import { useState, useEffect } from 'react';
import { useAuthStore, useWalletStore } from '@/stores';
import { useUIStore } from '@/stores/uiStore';
import { formatAddress, formatCurrency } from '@/utils';
import { useLocation } from 'wouter';
import { getProvider } from '@/utils/web3';
import { ethers } from 'ethers';

export default function Header({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { user, logout } = useAuthStore();
  const { wallet, disconnectWallet, updateBalance } = useWalletStore();
  const [, setLocation] = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch and update real balance from blockchain
  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet?.address) return;

      try {
        const provider = getProvider();
        if (provider) {
          const balanceBigInt = await provider.getBalance(wallet.address);
          const balance = ethers.formatEther(balanceBigInt);
          updateBalance(balance);
        }
      } catch (error) {
        console.error('Failed to fetch balance in Header:', error);
      }
    };

    fetchBalance();
    // Refresh balance every 30 seconds to keep in sync with Dashboard
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [wallet?.address, updateBalance]);

  const handleLogout = () => {
    try {
      logout();
      disconnectWallet();
      // Clear Web3Auth storage
      localStorage.removeItem('chainsync_auth');
      // Navigate to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm relative z-60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            {/* Mobile menu button */}
            <div className="mr-2 md:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.debug('[Header] mobile menu button clicked (hook)');
                  const setOpen = useUIStore.getState().setMobileSidebarOpen;
                  setOpen(true);
                }}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ChainSync</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {wallet?.isConnected && (
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{formatAddress(wallet.address)}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(wallet.balance)} ETH</span>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.firstName}</span>
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Settings
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
