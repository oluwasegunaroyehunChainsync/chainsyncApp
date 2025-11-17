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
    if (!selectedProposal || !voteAmount) {
      notify.error('Please select a proposal and enter voting power');
      return;
    }

    setIsVoting(true);
    try {
      await vote(selectedProposal, selectedChoice, voteAmount);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Governance</h1>
        <p className="text-gray-600 mt-1">Participate in protocol governance and shape the future of ChainSync</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposals List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Proposals */}
          <Card variant="elevated">
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-900">Active Proposals</h2>
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
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 mb-3">{proposal.title}</p>
                      <p className="text-sm text-gray-600 mb-4">{proposal.description}</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">For</span>
                            <span className="font-semibold text-green-600">{forPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${forPercent}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Against</span>
                            <span className="font-semibold text-red-600">{againstPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${againstPercent}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Abstain</span>
                            <span className="font-semibold text-gray-600">{abstainPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${abstainPercent}%` }}></div>
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
                <h2 className="text-xl font-bold text-gray-900">Passed Proposals</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {passedProposals.map((proposal) => (
                    <div key={proposal.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-semibold text-gray-900">{proposal.title}</p>
                      <p className="text-sm text-gray-600 mt-1">✓ Passed</p>
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
            <h2 className="text-xl font-bold text-gray-900">Cast Your Vote</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            {selectedProposal ? (
              <>
                <div>
                  <p className="text-gray-600 text-sm">Selected Proposal</p>
                  <p className="font-semibold text-gray-900 mt-1 text-sm">
                    {proposals.find((p) => p.id === selectedProposal)?.title}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Your Vote</label>
                  <div className="space-y-2">
                    {(['for', 'against', 'abstain'] as const).map((choice) => (
                      <label key={choice} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="vote"
                          value={choice}
                          checked={selectedChoice === choice}
                          onChange={(e) => setSelectedChoice(e.target.value as typeof choice)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-900 font-medium capitalize">{choice}</span>
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
              <p className="text-gray-600 text-center py-8">Select a proposal to vote</p>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Governance Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="outlined">
          <Card.Body className="space-y-3">
            <p className="text-3xl">🗳️</p>
            <h3 className="font-semibold text-gray-900">Democratic</h3>
            <p className="text-sm text-gray-600">One token, one vote. Community-driven decisions</p>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Body className="space-y-3">
            <p className="text-3xl">⏱️</p>
            <h3 className="font-semibold text-gray-900">Transparent</h3>
            <p className="text-sm text-gray-600">All voting records on-chain and immutable</p>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Body className="space-y-3">
            <p className="text-3xl">🚀</p>
            <h3 className="font-semibold text-gray-900">Impactful</h3>
            <p className="text-sm text-gray-600">Your vote directly shapes protocol upgrades</p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
