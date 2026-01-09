import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Wallet, ChainId, Asset } from '@/types';
import { SUPPORTED_CHAINS, SUPPORTED_ASSETS } from '@/constants';
import { getProvider } from '@/utils/web3';
import { ethers } from 'ethers';

interface WalletState {
  wallet: Wallet | null;
  assets: Asset[];
  supportedChains: typeof SUPPORTED_CHAINS;
  isConnecting: boolean;
  error: string | null;
  
  connectWallet: (address: string, chainId: ChainId) => Promise<void>;
  disconnectWallet: () => void;
  switchChain: (chainId: ChainId) => Promise<void>;
  updateBalance: (balance: string) => void;
  updateAssets: (assets: Asset[]) => void;
  getAssetBalance: (symbol: string) => string;
  getTotalValue: () => string;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: null,
      assets: Object.values(SUPPORTED_ASSETS),
      supportedChains: SUPPORTED_CHAINS,
      isConnecting: false,
      error: null,

      connectWallet: async (address: string, chainId: ChainId) => {
        set({ isConnecting: true, error: null });
        try {
          // Fetch real balance from blockchain
          let balance = '0';
          try {
            const provider = getProvider();
            if (provider) {
              const balanceBigInt = await provider.getBalance(address);
              balance = ethers.formatEther(balanceBigInt);
            }
          } catch (balanceError) {
            console.error('Failed to fetch balance:', balanceError);
            balance = '0';
          }

          const wallet: Wallet = {
            address,
            balance,
            chainId,
            isConnected: true,
          };

          set({ wallet, isConnecting: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Connection failed';
          set({ error: errorMessage, isConnecting: false });
          throw error;
        }
      },

      disconnectWallet: () => {
        set({ wallet: null, error: null });
      },

      switchChain: async (chainId: ChainId) => {
        set({ isConnecting: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          set((state) => ({
            wallet: state.wallet ? { ...state.wallet, chainId } : null,
            isConnecting: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Chain switch failed';
          set({ error: errorMessage, isConnecting: false });
          throw error;
        }
      },

      updateBalance: (balance: string) => {
        set((state) => ({
          wallet: state.wallet ? { ...state.wallet, balance } : null,
        }));
      },

      updateAssets: (assets: Asset[]) => {
        set({ assets });
      },

      getAssetBalance: (symbol: string) => {
        const state = get();
        const asset = state.assets.find((a) => a.symbol === symbol);
        return asset?.balance || '0';
      },

      getTotalValue: () => {
        const state = get();
        const total = state.assets.reduce((sum, asset) => {
          const balance = parseFloat(asset.balance) || 0;
          const value = balance * asset.usdPrice;
          return sum + value;
        }, 0);
        return total.toFixed(2);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        wallet: state.wallet,
        assets: state.assets,
      }),
    }
  )
);
