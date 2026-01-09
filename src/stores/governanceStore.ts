import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Proposal, Vote, VoteChoice } from '@/types';
import { generateId } from '@/utils';
import { apiClient } from '@/lib/api';

interface GovernanceState {
  proposals: Proposal[];
  votes: Vote[];
  votingPower: string;
  isLoading: boolean;
  error: string | null;

  // Fetch proposals from backend
  fetchProposals: () => Promise<void>;

  // Get specific proposal
  fetchProposal: (proposalId: string) => Promise<void>;

  // Create new proposal
  createProposal: (title: string, description: string, type: string) => Promise<void>;

  // Vote on proposal
  vote: (proposalId: string, support: boolean) => Promise<void>;

  // Get user's votes
  fetchUserVotes: () => Promise<void>;

  // Get voting power for address
  fetchVotingPower: (address: string) => Promise<void>;

  // Local functions
  getProposalById: (id: string) => Proposal | undefined;
  getVotesByProposal: (proposalId: string) => Vote[];
  getTotalVotingPower: () => string;
  clearError: () => void;
}

export const useGovernanceStore = create<GovernanceState>()(
  persist(
    (set, get) => ({
      proposals: [],
      votes: [],
      votingPower: '0',
      isLoading: false,
      error: null,

      fetchProposals: async () => {
        set({ isLoading: true, error: null });
        try {
          const proposals = await apiClient.getProposals() as Proposal[];
          set({ proposals: proposals || [], isLoading: false });
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch proposals';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchProposal: async (proposalId: string) => {
        set({ isLoading: true, error: null });
        try {
          const proposal = await apiClient.getProposal(proposalId) as Proposal;

          set((state) => ({
            proposals: state.proposals.some(p => p.id === proposalId)
              ? state.proposals.map(p => p.id === proposalId ? proposal : p)
              : [...state.proposals, proposal],
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch proposal';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      createProposal: async (title: string, description: string, type: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.createProposal({
            title,
            description,
            type,
          }) as any;

          const newProposal: Proposal = {
            id: result.proposalId || generateId('proposal_'),
            title,
            description,
            status: 'active',
            votesFor: '0',
            votesAgainst: '0',
            votesAbstain: '0',
            totalVotes: '0',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            proposer: result.proposer || '',
            details: description,
          };

          set((state) => ({
            proposals: [newProposal, ...state.proposals],
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to create proposal';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      vote: async (proposalId: string, support: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.vote({
            proposalId,
            support,
          }) as any;

          const proposal = get().proposals.find((p) => p.id === proposalId);
          if (!proposal) throw new Error('Proposal not found');

          const vote: Vote = {
            id: generateId('vote_'),
            proposalId,
            choice: support ? 'for' : 'against',
            amount: get().votingPower || '0',
            voter: result.voter || '',
            createdAt: new Date().toISOString(),
          };

          const voteAmount = parseFloat(vote.amount);
          set((state) => ({
            votes: [...state.votes, vote],
            proposals: state.proposals.map((p) =>
              p.id === proposalId
                ? {
                    ...p,
                    votesFor: support
                      ? (parseFloat(p.votesFor) + voteAmount).toFixed(0)
                      : p.votesFor,
                    votesAgainst: !support
                      ? (parseFloat(p.votesAgainst) + voteAmount).toFixed(0)
                      : p.votesAgainst,
                    totalVotes: (parseFloat(p.totalVotes) + voteAmount).toFixed(0),
                  }
                : p
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = error?.message || 'Voting failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchUserVotes: async () => {
        set({ isLoading: true, error: null });
        try {
          const votes = await apiClient.getVotes() as Vote[];
          set({ votes: votes || [], isLoading: false });
        } catch (error: any) {
          // If unauthorized, don't set error
          if (error?.message?.includes('401') || error?.message?.includes('authorization')) {
            set({ isLoading: false });
          } else {
            const errorMessage = error?.message || 'Failed to fetch votes';
            set({ error: errorMessage, isLoading: false });
          }
        }
      },

      fetchVotingPower: async (address: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.getVotingPower(address) as any;
          set({
            votingPower: result?.votingPower || '0',
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch voting power';
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
