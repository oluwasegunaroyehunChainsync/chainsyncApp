import React, { useEffect, useState } from 'react';
import { useWalletStore, useTransferStore, useValidatorStore, useGovernanceStore } from '@/stores';
import { formatCurrency, formatAddress } from '@/utils';
import Card from '@/components/Card';
import Button from '@/components/Button';

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

export default function Dashboard() {
  const { wallet, disconnectWallet } = useWalletStore();
  const { transfers } = useTransferStore();
  const { stakingPositions, getTotalStaked, getTotalRewards } = useValidatorStore();
  const { proposals } = useGovernanceStore();
  const [stats, setStats] = useState<StatCard[]>([]);

  useEffect(() => {
    if (wallet) {
      setStats([
        {
          label: 'Wallet Balance',
          value: wallet.balance ? `$${formatCurrency(parseFloat(wallet.balance))}` : '$0.00',
          change: '+12.5%',
          icon: '💰',
          color: 'from-blue-500 to-blue-600',
        },
        {
          label: 'Total Staked',
          value: `${getTotalStaked()} ETH`,
          change: '+8.2%',
          icon: '📈',
          color: 'from-green-500 to-green-600',
        },
        {
          label: 'Rewards Earned',
          value: `${getTotalRewards()} ETH`,
          change: '+5.1%',
          icon: '🎁',
          color: 'from-purple-500 to-purple-600',
        },
        {
          label: 'Active Transfers',
          value: transfers.filter((t) => t.status === 'pending').length.toString(),
          change: '-2.3%',
          icon: '🔄',
          color: 'from-orange-500 to-orange-600',
        },
      ]);
    }
  }, [wallet, getTotalStaked, getTotalRewards, transfers]);

  const recentTransfers = transfers.slice(0, 5);
  const activeProposals = proposals.filter((p) => p.status === 'active');

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="elevated" className="max-w-md w-full mx-4">
          <Card.Body className="text-center space-y-4">
            <div className="text-5xl">🔗</div>
            <h2 className="text-2xl font-bold text-gray-900">Wallet Not Connected</h2>
            <p className="text-gray-600">Please connect your wallet to access the dashboard</p>
            <Button variant="primary" fullWidth>
              Connect Wallet
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to ChainSync. Your cross-chain settlement hub.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-600">Connected Wallet</p>
            <p className="text-lg font-mono font-semibold text-gray-900">{formatAddress(wallet.address)}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={disconnectWallet}
          >
            Disconnect
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} variant="elevated">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
              <span className="text-gray-500 text-sm">from last month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transfers */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <Card.Header>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                <a href="/transfer" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View all →
                </a>
              </div>
            </Card.Header>
            <Card.Body>
              {recentTransfers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Asset</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">View Explorer</th>

                      </tr>
                    </thead>
                    <tbody>
                      {recentTransfers.map((transfer) => (
                        <tr key={transfer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900">{transfer.asset}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{transfer.amount}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                transfer.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : transfer.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {new Date(transfer.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No transfers yet</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Start your first transfer
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Staking Summary */}
        <div className="space-y-6">
          <Card variant="elevated">
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-900">Staking Summary</h2>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Total Staked</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{getTotalStaked()} ETH</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Unclaimed Rewards</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{getTotalRewards()} ETH</p>
              </div>
              <Button variant="primary" fullWidth>
                Claim Rewards
              </Button>
            </Card.Body>
          </Card>

          <Card variant="elevated">
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-900">Active Proposals</h2>
            </Card.Header>
            <Card.Body>
              {activeProposals.length > 0 ? (
                <div className="space-y-3">
                  {activeProposals.slice(0, 3).map((proposal) => (
                    <div key={proposal.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <p className="font-semibold text-gray-900 text-sm">{proposal.title}</p>
                      <p className="text-gray-600 text-xs mt-1">
                        {Math.round((parseInt(proposal.votesFor) / parseInt(proposal.totalVotes)) * 100)}% voting
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No active proposals</p>
              )}
              <Button variant="outline" fullWidth className="mt-4">
                View all proposals
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card variant="elevated">
        <Card.Header>
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/transfer" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <div className="text-2xl mb-2">🔄</div>
              <p className="text-sm font-semibold text-gray-900">Transfer</p>
            </a>
            <a href="/validators" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <div className="text-2xl mb-2">📈</div>
              <p className="text-sm font-semibold text-gray-900">Stake</p>
            </a>
            <a href="/governance" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <div className="text-2xl mb-2">🗳️</div>
              <p className="text-sm font-semibold text-gray-900">Vote</p>
            </a>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-semibold text-gray-900">Analytics</p>
            </button>
          </div>
        </Card.Body>
      </Card>

      {/* Wallet Info */}
      <Card variant="outlined">
        <Card.Header>
          <h2 className="text-xl font-bold text-gray-900">Wallet Information</h2>
        </Card.Header>
        <Card.Body className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Address</p>
            <p className="text-sm font-mono text-gray-900 mt-1 break-all">{wallet.address}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Network</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{wallet.chainId === 1 ? 'Ethereum Mainnet' : 'Connected'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Balance</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{wallet.balance} ETH</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
