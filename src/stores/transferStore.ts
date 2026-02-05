import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transfer, TransferStatus } from '@/types';
import { generateId } from '@/utils';
import { apiClient } from '@/lib/api';

// Transaction progress step interface
export interface TransactionStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp?: number;
  duration?: string;
  txHash?: string;
  blockNumber?: string;
  explorerUrl?: string;
}

// Active transaction progress data
export interface TransactionProgressData {
  id: string;
  amount: string;
  asset: string;
  sourceChain: string;
  destinationChain: string;
  steps: TransactionStep[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime: number;
}

interface TransferState {
  transfers: Transfer[];
  currentTransfer: Transfer | null;
  isLoading: boolean;
  error: string | null;
  quote: any | null;

  // Transaction progress tracking
  activeProgress: TransactionProgressData | null;
  isProgressDrawerOpen: boolean;

  // Get quote from backend
  getQuote: (sourceChainId: number, destinationChainId: number, contractAddress: string, amount: string) => Promise<void>;

  // Initiate cross-chain transfer
  initiateCrossChainTransfer: (sourceChainId: number, destinationChainId: number, tokenAddress: string, amount: string, recipient: string, contractAddress: string) => Promise<any>;

  // Initiate same-chain transfer
  initiateSameChainTransfer: (sourceChainId: number, tokenAddress: string, amount: string, recipient: string, contractAddress: string) => Promise<any>;

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

  // Transaction progress drawer controls
  openProgressDrawer: () => void;
  closeProgressDrawer: () => void;
  setActiveProgress: (progress: TransactionProgressData | null) => void;
  updateProgressStep: (stepId: string, updates: Partial<TransactionStep>) => void;
  startTransactionProgress: (data: {
    id: string;
    amount: string;
    asset: string;
    sourceChain: string;
    destinationChain: string;
  }) => void;
  simulateProgressSteps: () => void;
}

export const useTransferStore = create<TransferState>()(
  persist(
    (set, get) => ({
      transfers: [],
      currentTransfer: null,
      isLoading: false,
      error: null,
      quote: null,
      activeProgress: null,
      isProgressDrawerOpen: false,

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

      initiateCrossChainTransfer: async (sourceChainId, destinationChainId, tokenAddress, amount, recipient, contractAddress) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.initiateCrossChainTransfer({
            sourceChainId,
            destinationChainId,
            tokenAddress,
            amount,
            recipient,
            contractAddress,
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

      initiateSameChainTransfer: async (sourceChainId, tokenAddress, amount, recipient, contractAddress) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.initiateSameChainTransfer({
            sourceChainId,
            tokenAddress,
            amount,
            recipient,
            contractAddress,
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

      // Transaction progress drawer controls
      openProgressDrawer: () => {
        set({ isProgressDrawerOpen: true });
      },

      closeProgressDrawer: () => {
        set({ isProgressDrawerOpen: false });
      },

      setActiveProgress: (progress: TransactionProgressData | null) => {
        set({ activeProgress: progress });
      },

      updateProgressStep: (stepId: string, updates: Partial<TransactionStep>) => {
        set((state) => {
          if (!state.activeProgress) return state;
          return {
            activeProgress: {
              ...state.activeProgress,
              steps: state.activeProgress.steps.map((step) =>
                step.id === stepId ? { ...step, ...updates } : step
              ),
            },
          };
        });
      },

      startTransactionProgress: (data) => {
        const steps: TransactionStep[] = [
          { id: 'step_1', label: 'Cross-chain transfer initiated', status: 'pending' },
          { id: 'step_2', label: `${data.sourceChain} confirmed your transaction`, status: 'pending' },
          { id: 'step_3', label: 'ChainSync validator verified the transfer', status: 'pending' },
          { id: 'step_4', label: 'Cross-chain settlement in progress', status: 'pending' },
          { id: 'step_5', label: `Delivering to ${data.destinationChain}`, status: 'pending' },
        ];

        const progress: TransactionProgressData = {
          id: data.id,
          amount: data.amount,
          asset: data.asset,
          sourceChain: data.sourceChain,
          destinationChain: data.destinationChain,
          steps,
          status: 'processing',
          startTime: Date.now(),
        };

        set({
          activeProgress: progress,
          isProgressDrawerOpen: true,
        });
      },

      // Simulate progress steps for demo/testing - can be replaced with real websocket updates
      simulateProgressSteps: () => {
        const { activeProgress, updateProgressStep } = get();
        if (!activeProgress) return;

        const stepDelays = [2000, 5000, 8000, 15000, 20000]; // Delays for each step completion
        let currentStepIndex = 0;

        const processNextStep = () => {
          const step = activeProgress.steps[currentStepIndex];
          if (!step) {
            // All steps completed
            set((state) => ({
              activeProgress: state.activeProgress
                ? { ...state.activeProgress, status: 'completed' }
                : null,
            }));
            return;
          }

          // Mark current step as in_progress
          updateProgressStep(step.id, {
            status: 'in_progress',
            timestamp: Date.now(),
          });

          // After delay, mark as completed and move to next
          setTimeout(() => {
            const duration = `${Math.floor(stepDelays[currentStepIndex] / 1000)} seconds`;
            updateProgressStep(step.id, {
              status: 'completed',
              duration,
              explorerUrl: currentStepIndex < 2 ? 'https://etherscan.io/tx/0x...' : undefined,
              blockNumber: currentStepIndex === 1 ? '38798476' : undefined,
            });

            currentStepIndex++;
            processNextStep();
          }, stepDelays[currentStepIndex]);
        };

        processNextStep();
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
