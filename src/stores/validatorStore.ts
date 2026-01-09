import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Validator, StakingPosition } from '@/types';
import { generateId } from '@/utils';
import { apiClient } from '@/lib/api';

interface ValidatorState {
  validators: Validator[];
  stakingPositions: StakingPosition[];
  activeValidatorCount: number;
  isLoading: boolean;
  error: string | null;

  // Fetch validators from backend
  fetchValidators: () => Promise<void>;

  // Get validator info from backend
  fetchValidatorInfo: (address: string) => Promise<void>;

  // Check if validator is active
  checkValidatorActive: (address: string) => Promise<boolean>;

  // Get validator stake amount
  fetchValidatorStake: (address: string) => Promise<void>;

  // Register as validator
  registerValidator: (validatorAddress: string, stakeAmount: string) => Promise<void>;

  // Stake to validator
  stake: (validatorAddress: string, amount: string) => Promise<void>;

  // Local functions
  unstake: (positionId: string) => Promise<void>;
  claimRewards: (positionId: string) => Promise<void>;
  getValidatorById: (id: string) => Validator | undefined;
  getTotalStaked: () => string;
  getTotalRewards: () => string;
  clearError: () => void;
}

export const useValidatorStore = create<ValidatorState>()(
  persist(
    (set, get) => ({
      validators: [],
      stakingPositions: [],
      activeValidatorCount: 0,
      isLoading: false,
      error: null,

      fetchValidators: async () => {
        set({ isLoading: true, error: null });
        try {
          const validators = await apiClient.getValidators() as any[];
          const count = await apiClient.getActiveValidatorCount() as any;

          set({
            validators: validators || [],
            activeValidatorCount: count?.count || 0,
            isLoading: false
          });
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch validators';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchValidatorInfo: async (address: string) => {
        set({ isLoading: true, error: null });
        try {
          const validatorInfo = await apiClient.getValidatorInfo(address) as any;

          set((state) => ({
            validators: state.validators.map(v =>
              v.address === address ? { ...v, ...validatorInfo } : v
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch validator info';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      checkValidatorActive: async (address: string) => {
        try {
          const result = await apiClient.isValidatorActive(address) as any;
          return result?.isActive || false;
        } catch (error: any) {
          console.error('Failed to check validator status:', error);
          return false;
        }
      },

      fetchValidatorStake: async (address: string) => {
        set({ isLoading: true, error: null });
        try {
          const stakeInfo = await apiClient.getValidatorStake(address) as any;

          set((state) => ({
            validators: state.validators.map(v =>
              v.address === address ? { ...v, stakedAmount: stakeInfo?.stake || '0' } : v
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch validator stake';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      registerValidator: async (validatorAddress: string, stakeAmount: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.registerValidator({
            validatorAddress,
            stakeAmount,
          }) as any;

          // Create validator object
          const validator: Validator = {
            id: generateId('validator_'),
            name: 'Your Validator',
            address: validatorAddress,
            commission: '5%',
            apy: '12%',
            stakedAmount: stakeAmount,
            delegators: 0,
            uptime: '100%',
            totalRewards: '0',
            description: 'New validator',
          };

          set((state) => ({
            validators: [...state.validators, validator],
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to register validator';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      stake: async (validatorAddress: string, amount: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.stakeValidator({
            validatorAddress,
            amount,
          }) as any;

          const validator = get().validators.find((v) => v.address === validatorAddress);

          const position: StakingPosition = {
            id: generateId('position_'),
            validatorId: validator?.id || validatorAddress,
            validatorName: validator?.name || 'Unknown Validator',
            amount,
            rewards: '0',
            apy: validator?.apy || '0%',
            claimableRewards: '0',
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            stakingPositions: [...state.stakingPositions, position],
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Staking failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      unstake: async (positionId: string) => {
        set({ isLoading: true, error: null });
        try {
          // In real implementation, call backend API
          await new Promise((resolve) => setTimeout(resolve, 500));
          set((state) => ({
            stakingPositions: state.stakingPositions.filter((p) => p.id !== positionId),
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Unstaking failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      claimRewards: async (positionId: string) => {
        set({ isLoading: true, error: null });
        try {
          // In real implementation, call backend API
          await new Promise((resolve) => setTimeout(resolve, 500));
          set((state) => ({
            stakingPositions: state.stakingPositions.map((p) =>
              p.id === positionId
                ? {
                    ...p,
                    rewards: (parseFloat(p.rewards) + parseFloat(p.claimableRewards)).toFixed(6),
                    claimableRewards: '0',
                    lastRewardClaim: new Date().toISOString(),
                  }
                : p
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Claim failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      getValidatorById: (id: string) => {
        return get().validators.find((v) => v.id === id);
      },

      getTotalStaked: () => {
        const total = get().stakingPositions.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        return total.toFixed(6);
      },

      getTotalRewards: () => {
        const total = get().stakingPositions.reduce((sum, p) => sum + parseFloat(p.rewards), 0);
        return total.toFixed(6);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'validator-storage',
      partialize: (state) => ({
        stakingPositions: state.stakingPositions,
      }),
    }
  )
);
