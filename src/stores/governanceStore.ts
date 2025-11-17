import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Proposal, Vote, VoteChoice } from '@/types';
import { generateId } from '@/utils';

interface GovernanceState {
  proposals: Proposal[];
  votes: Vote[];
  isLoading: boolean;
  error: string | null;
  
  fetchProposals: () => Promise<void>;
  vote: (proposalId: string, choice: VoteChoice, amount: string) => Promise<void>;
  getProposalById: (id: string) => Proposal | undefined;
  getVotesByProposal: (proposalId: string) => Vote[];
  getTotalVotingPower: () => string;
  clearError: () => void;
}

export const useGovernanceStore = create<GovernanceState>()(
  persist(
    (set, get) => ({
      proposals: [
        {
          id: 'proposal_1',
          title: 'Increase validator commission cap to 20%',
          description: 'Proposal to increase the maximum commission that validators can charge from 15% to 20% to improve validator economics.',
          status: 'active',
          votesFor: '1250000',
          votesAgainst: '350000',
          votesAbstain: '150000',
          totalVotes: '1750000',
          startDate: new Date(Date.now() - 172800000).toISOString(),
          endDate: new Date(Date.now() + 432000000).toISOString(),
          proposer: '0x' + 'a'.repeat(40),
          details: 'This proposal aims to make validator operations more sustainable...',
        },
        {
          id: 'proposal_2',
          title: 'Reduce transfer fee from 0.1% to 0.05%',
          description: 'Community proposal to reduce cross-chain transfer fees to encourage more usage.',
          status: 'active',
          votesFor: '2100000',
          votesAgainst: '450000',
          votesAbstain: '200000',
          totalVotes: '2750000',
          startDate: new Date(Date.now() - 86400000).toISOString(),
          endDate: new Date(Date.now() + 518400000).toISOString(),
          proposer: '0x' + 'b'.repeat(40),
          details: 'Lower fees will increase adoption and network activity...',
        },
        {
          id: 'proposal_3',
          title: 'Add support for Polygon to governance',
          description: 'Enable Polygon chain governance participation through multi-chain voting.',
          status: 'passed',
          votesFor: '3200000',
          votesAgainst: '200000',
          votesAbstain: '100000',
          totalVotes: '3500000',
          startDate: new Date(Date.now() - 604800000).toISOString(),
          endDate: new Date(Date.now() - 172800000).toISOString(),
          proposer: '0x' + 'c'.repeat(40),
          details: 'This will enable governance participation from Polygon users...',
        },
      ],
      votes: [],
      isLoading: false,
      error: null,

      fetchProposals: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch proposals';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      vote: async (proposalId: string, choice: VoteChoice, amount: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const proposal = get().proposals.find((p) => p.id === proposalId);
          if (!proposal) throw new Error('Proposal not found');

          const vote: Vote = {
            id: generateId('vote_'),
            proposalId,
            choice,
            amount,
            voter: '0x' + Math.random().toString(16).slice(2, 42),
            createdAt: new Date().toISOString(),
          };

          const voteAmount = parseFloat(amount);
          set((state) => ({
            votes: [...state.votes, vote],
            proposals: state.proposals.map((p) =>
              p.id === proposalId
                ? {
                    ...p,
                    votesFor:
                      choice === 'for'
                        ? (parseFloat(p.votesFor) + voteAmount).toFixed(0)
                        : p.votesFor,
                    votesAgainst:
                      choice === 'against'
                        ? (parseFloat(p.votesAgainst) + voteAmount).toFixed(0)
                        : p.votesAgainst,
                    votesAbstain:
                      choice === 'abstain'
                        ? (parseFloat(p.votesAbstain) + voteAmount).toFixed(0)
                        : p.votesAbstain,
                    totalVotes: (parseFloat(p.totalVotes) + voteAmount).toFixed(0),
                  }
                : p
            ),
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Voting failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      getProposalById: (id: string) => {
        return get().proposals.find((p) => p.id === id);
      },

      getVotesByProposal: (proposalId: string) => {
        return get().votes.filter((v) => v.proposalId === proposalId);
      },

      getTotalVotingPower: () => {
        const total = get().votes.reduce((sum, v) => sum + parseFloat(v.amount), 0);
        return total.toFixed(0);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'governance-storage',
      partialize: (state) => ({
        votes: state.votes,
      }),
    }
  )
);
