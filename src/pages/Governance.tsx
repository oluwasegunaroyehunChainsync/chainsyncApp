import React, { useState } from 'react';
import { useGovernanceStore, notify } from '@/stores';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function Governance() {
  const { proposals, vote } = useGovernanceStore();
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [voteAmount, setVoteAmount] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<'for' | 'against' | 'abstain'>('for');
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (!selectedProposal) {
      notify.error('Please select a proposal');
      return;
    }

    setIsVoting(true);
    try {
      // Convert choice to boolean: 'for' = true, 'against' = false, 'abstain' = false
      const support = selectedChoice === 'for';
      await vote(selectedProposal, support);
      notify.success(`Vote recorded: ${selectedChoice.toUpperCase()}`);
      setVoteAmount('');
      setSelectedProposal(null);
    } catch (error) {
      notify.error('Voting failed');
    } finally {
      setIsVoting(false);
    }
  };

  const activeProposals = proposals.filter((p) => p.status === 'active');
  const passedProposals = proposals.filter((p) => p.status === 'passed');

  return (
    <div className="container px-4 sm:px-6 md:px-8 mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Governance</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Participate in protocol governance and shape the future of ChainSync</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proposals List */}
        <div className="md:col-span-2 space-y-6">
          {/* Active Proposals */}
          <Card variant="elevated">
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Proposals</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {activeProposals.map((proposal) => {
                  const forPercent = Math.round((parseInt(proposal.votesFor) / parseInt(proposal.totalVotes)) * 100);
                  const againstPercent = Math.round((parseInt(proposal.votesAgainst) / parseInt(proposal.totalVotes)) * 100);
                  const abstainPercent = Math.round((parseInt(proposal.votesAbstain) / parseInt(proposal.totalVotes)) * 100);

                  return (
                    <div
                      key={proposal.id}
                      onClick={() => setSelectedProposal(proposal.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedProposal === proposal.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white mb-3">{proposal.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{proposal.description}</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">For</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">{forPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${forPercent}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Against</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">{againstPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${againstPercent}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Abstain</span>
                            <span className="font-semibold text-gray-600 dark:text-gray-400">{abstainPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-gray-400 dark:bg-gray-500 h-2 rounded-full" style={{ width: `${abstainPercent}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          {/* Passed Proposals */}
          {passedProposals.length > 0 && (
            <Card variant="elevated">
              <Card.Header>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Passed Proposals</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {passedProposals.map((proposal) => (
                    <div key={proposal.id} className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="font-semibold text-gray-900 dark:text-white">{proposal.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">✓ Passed</p>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Voting Panel */}
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cast Your Vote</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            {selectedProposal ? (
              <>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Selected Proposal</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1 text-sm">
                    {proposals.find((p) => p.id === selectedProposal)?.title}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Your Vote</label>
                  <div className="space-y-2">
                    {(['for', 'against', 'abstain'] as const).map((choice) => (
                      <label key={choice} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="vote"
                          value={choice}
                          checked={selectedChoice === choice}
                          onChange={(e) => setSelectedChoice(e.target.value as typeof choice)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-900 dark:text-white font-medium capitalize">{choice}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Input
                  label="Voting Power"
                  type="number"
                  value={voteAmount}
                  onChange={(e) => setVoteAmount(e.target.value)}
                  placeholder="0.00"
                  suffix="CHAIN"
                />

                <Button
                  variant="primary"
                  fullWidth
                  isLoading={isVoting}
                  onClick={handleVote}
                >
                  {isVoting ? 'Voting...' : 'Submit Vote'}
                </Button>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">Select a proposal to vote</p>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Governance Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="outlined">
          <Card.Body className="space-y-3">
            <p className="text-3xl">🗳️</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Democratic</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">One token, one vote. Community-driven decisions</p>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Body className="space-y-3">
            <p className="text-3xl">⏱️</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Transparent</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">All voting records on-chain and immutable</p>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Body className="space-y-3">
            <p className="text-3xl">🚀</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Impactful</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your vote directly shapes protocol upgrades</p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
