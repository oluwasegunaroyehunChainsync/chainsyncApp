import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Validator, StakingPosition } from '@/types';
import { generateId } from '@/utils';

interface ValidatorState {
  validators: Validator[];
  stakingPositions: StakingPosition[];
  isLoading: boolean;
  error: string | null;
  
  fetchValidators: () => Promise<void>;
  stake: (validatorId: string, amount: string) => Promise<void>;
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
      validators: [
        {
          id: 'validator_1',
          name: 'Staking Rewards',
          address: '0x' + 'a'.repeat(40),
          commission: '5%',
          apy: '12.5%',
          stakedAmount: '2500000',
          delegators: 1250,
          uptime: '99.9%',
          totalRewards: '125000',
          description: 'Professional validator with excellent track record',
          website: 'https://stakingrewards.com',
        },
        {
          id: 'validator_2',
          name: 'Lido Finance',
          address: '0x' + 'b'.repeat(40),
          commission: '10%',
          apy: '11.8%',
          stakedAmount: '5000000',
          delegators: 2500,
          uptime: '99.95%',
          totalRewards: '590000',
          description: 'Largest liquid staking provider',
          website: 'https://lido.fi',
        },
        {
          id: 'validator_3',
          name: 'Coinbase Cloud',
          address: '0x' + 'c'.repeat(40),
          commission: '15%',
          apy: '11.2%',
          stakedAmount: '3000000',
          delegators: 800,
          uptime: '99.8%',
          totalRewards: '336000',
          description: 'Backed by Coinbase, highly secure',
          website: 'https://coinbase.com',
        },
        {
          id: 'validator_4',
          name: 'Kraken Staking',
          address: '0x' + 'd'.repeat(40),
          commission: '12%',
          apy: '12.1%',
          stakedAmount: '1800000',
          delegators: 600,
          uptime: '99.85%',
          totalRewards: '217800',
          description: 'Kraken exchange staking service',
          website: 'https://kraken.com',
        },
      ],
      stakingPositions: [
        {
          id: 'position_1',
          validatorId: 'validator_1',
          validatorName: 'Staking Rewards',
          amount: '10',
          rewards: '1.25',
          apy: '12.5%',
          claimableRewards: '0.5',
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          lastRewardClaim: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      isLoading: false,
      error: null,

      fetchValidators: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch validators';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      stake: async (validatorId: string, amount: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const validator = get().validators.find((v) => v.id === validatorId);
          if (!validator) throw new Error('Validator not found');

          const apy = validator.apy;
          const position: StakingPosition = {
            id: generateId('position_'),
            validatorId,
            validatorName: validator.name,
            amount,
            rewards: '0',
            apy,
            claimableRewards: '0',
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            stakingPositions: [...state.stakingPositions, position],
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Staking failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      unstake: async (positionId: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          set((state) => ({
            stakingPositions: state.stakingPositions.filter((p) => p.id !== positionId),
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unstaking failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      claimRewards: async (positionId: string) => {
        set({ isLoading: true, error: null });
        try {
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
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Claim failed';
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
