import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transfer, TransferStatus } from '@/types';
import { generateId } from '@/utils';
import { apiClient } from '@/lib/api';

interface TransferState {
  transfers: Transfer[];
  currentTransfer: Transfer | null;
  isLoading: boolean;
  error: string | null;
  quote: any | null;

  // Get quote from backend
  getQuote: (sourceChainId: number, destinationChainId: number, contractAddress: string, amount: string) => Promise<void>;

  // Initiate cross-chain transfer
  initiateCrossChainTransfer: (sourceChainId: number, destinationChainId: number, tokenAddress: string, amount: string, recipient: string) => Promise<any>;

  // Initiate same-chain transfer
  initiateSameChainTransfer: (sourceChainId: number, tokenAddress: string, amount: string, recipient: string) => Promise<any>;

  // Fetch transfer history from backend
  fetchTransferHistory: () => Promise<void>;

  // Get specific transfer by ID
  fetchTransferById: (transferId: string) => Promise<void>;

  // Local state management
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
      transfers: [],
      currentTransfer: null,
      isLoading: false,
      error: null,
      quote: null,

      getQuote: async (sourceChainId, destinationChainId, contractAddress, amount) => {
        set({ isLoading: true, error: null });
        try {
          const quote = await apiClient.getTransferQuote({
            sourceChainId,
            destinationChainId,
            contractAddress,
            amount,
          });
          set({ quote, isLoading: false });
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to get quote';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      initiateCrossChainTransfer: async (sourceChainId, destinationChainId, tokenAddress, amount, recipient) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.initiateCrossChainTransfer({
            sourceChainId,
            destinationChainId,
            tokenAddress,
            amount,
            recipient,
          }) as any;

          // Create local transfer object from backend response
          const transfer: Transfer = {
            id: result.id || generateId('transfer_'),
            sourceChain: sourceChainId as any,
            destinationChain: destinationChainId as any,
            amount,
            asset: tokenAddress,
            fee: result.fee || '0',
            estimatedTime: result.estimatedTime || 120,
            status: result.status || 'pending',
            sourceHash: result.txHash || '',
            timestamp: Date.now(),
            createdAt: result.createdAt || new Date().toISOString(),
            updatedAt: result.updatedAt || new Date().toISOString(),
          };

          set((state) => ({
            currentTransfer: transfer,
            transfers: [transfer, ...state.transfers],
            isLoading: false,
          }));

          // Return the backend response for UI feedback
          return result;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to initiate cross-chain transfer';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      initiateSameChainTransfer: async (sourceChainId, tokenAddress, amount, recipient) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.initiateSameChainTransfer({
            sourceChainId,
            tokenAddress,
            amount,
            recipient,
          }) as any;

          // Create local transfer object from backend response
          const transfer: Transfer = {
            id: result.id || generateId('transfer_'),
            sourceChain: sourceChainId as any,
            destinationChain: sourceChainId as any, // Same chain
            amount,
            asset: tokenAddress,
            fee: result.fee || '0',
            estimatedTime: result.estimatedTime || 60,
            status: result.status || 'pending',
            sourceHash: result.txHash || '',
            timestamp: Date.now(),
            createdAt: result.createdAt || new Date().toISOString(),
            updatedAt: result.updatedAt || new Date().toISOString(),
          };

          set((state) => ({
            currentTransfer: transfer,
            transfers: [transfer, ...state.transfers],
            isLoading: false,
          }));

          // Return the backend response for UI feedback
          return result;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to initiate same-chain transfer';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchTransferHistory: async () => {
        set({ isLoading: true, error: null });
        try {
          const transfers = await apiClient.getTransfers() as Transfer[];
          set({ transfers: transfers || [], isLoading: false });
        } catch (error: any) {
          // If unauthorized, don't set error, just keep local transfers
          if (error?.message?.includes('401') || error?.message?.includes('authorization')) {
            set({ isLoading: false });
          } else {
            const errorMessage = error?.message || 'Failed to fetch transfer history';
            set({ error: errorMessage, isLoading: false });
          }
        }
      },

      fetchTransferById: async (transferId: string) => {
        set({ isLoading: true, error: null });
        try {
          const transfer = await apiClient.getTransfer(transferId) as Transfer;
          set((state) => ({
            currentTransfer: transfer,
            // Update transfer in list if it exists
            transfers: state.transfers.map(t => t.id === transferId ? transfer : t),
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch transfer';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
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
            transfers: completed
              ? state.transfers.map(t => t.id === completed.id ? completed : t)
              : state.transfers,
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
