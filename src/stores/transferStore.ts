import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transfer, ChainId, TransferStatus } from '@/types';
import { generateId } from '@/utils';

interface TransferState {
  transfers: Transfer[];
  currentTransfer: Transfer | null;
  isLoading: boolean;
  error: string | null;
  
  initializeTransfer: (sourceChain: ChainId, destinationChain: ChainId, amount: string, asset: string) => void;
  setTransferStatus: (status: TransferStatus) => void;
  completeTransfer: (destinationHash: string) => void;
  failTransfer: (reason: string) => void;
  getTransferHistory: () => Transfer[];
  getTransferById: (id: string) => Transfer | undefined;
  clearError: () => void;
}

export const useTransferStore = create<TransferState>()(
  persist(
    (set, get) => ({
      transfers: [
        {
          id: 'transfer_1',
          sourceChain: 1,
          destinationChain: 137,
          amount: '1.5',
          asset: 'ETH',
          fee: '0.0015',
          estimatedTime: 120,
          status: 'completed',
          sourceHash: '0x' + 'a'.repeat(64),
          destinationHash: '0x' + 'b'.repeat(64),
          timestamp: Date.now() - 86400000,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'transfer_2',
          sourceChain: 137,
          destinationChain: 56,
          amount: '500',
          asset: 'USDC',
          fee: '0.5',
          estimatedTime: 180,
          status: 'completed',
          sourceHash: '0x' + 'c'.repeat(64),
          destinationHash: '0x' + 'd'.repeat(64),
          timestamp: Date.now() - 172800000,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ],
      currentTransfer: null,
      isLoading: false,
      error: null,

      initializeTransfer: (sourceChain, destinationChain, amount, asset) => {
        const fee = (parseFloat(amount) * 0.001).toFixed(6);
        const transfer: Transfer = {
          id: generateId('transfer_'),
          sourceChain,
          destinationChain,
          amount,
          asset,
          fee,
          estimatedTime: 120,
          status: 'pending',
          timestamp: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ currentTransfer: transfer });
      },

      setTransferStatus: (status: TransferStatus) => {
        set((state) => ({
          currentTransfer: state.currentTransfer
            ? { ...state.currentTransfer, status, updatedAt: new Date().toISOString() }
            : null,
        }));
      },

      completeTransfer: (destinationHash: string) => {
        set((state) => {
          const completed = state.currentTransfer
            ? {
                ...state.currentTransfer,
                status: 'completed' as const,
                destinationHash,
                updatedAt: new Date().toISOString(),
              }
            : null;

          return {
            currentTransfer: null,
            transfers: completed ? [completed, ...state.transfers] : state.transfers,
          };
        });
      },

      failTransfer: (reason: string) => {
        set((state) => ({
          currentTransfer: state.currentTransfer
            ? { ...state.currentTransfer, status: 'failed' as const, updatedAt: new Date().toISOString() }
            : null,
          error: reason,
        }));
      },

      getTransferHistory: () => {
        return get().transfers.sort((a, b) => b.timestamp - a.timestamp);
      },

      getTransferById: (id: string) => {
        return get().transfers.find((t) => t.id === id);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'transfer-storage',
      partialize: (state) => ({
        transfers: state.transfers,
      }),
    }
  )
);
