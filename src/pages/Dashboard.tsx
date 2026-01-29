import { useEffect, useState } from 'react';
import { useWalletStore, useTransferStore, useGovernanceStore } from '@/stores';
import { formatAddress } from '@/utils';
import { getReadOnlyProvider, getUserValidatorInfo } from '@/utils/web3';
import { ethers } from 'ethers';
import Card from '@/components/Card';
import Button from '@/components/Button';

// Chain native token symbols and CoinGecko IDs
const CHAIN_TOKEN_CONFIG: Record<number, { symbol: string; name: string; coingeckoId: string }> = {
  1: { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum' },
  137: { symbol: 'MATIC', name: 'Polygon', coingeckoId: 'matic-network' },
  42161: { symbol: 'ETH', name: 'Arbitrum', coingeckoId: 'ethereum' },
  10: { symbol: 'ETH', name: 'Optimism', coingeckoId: 'ethereum' },
  56: { symbol: 'BNB', name: 'BNB Chain', coingeckoId: 'binancecoin' },
  43114: { symbol: 'AVAX', name: 'Avalanche', coingeckoId: 'avalanche-2' },
  8453: { symbol: 'ETH', name: 'Base', coingeckoId: 'ethereum' },
  250: { symbol: 'FTM', name: 'Fantom', coingeckoId: 'fantom' },
  7000: { symbol: 'ZETA', name: 'ZetaChain', coingeckoId: 'zetachain' },
  31337: { symbol: 'ETH', name: 'Localhost', coingeckoId: 'ethereum' },
};


// Default prices as fallback (will be updated from CoinGecko API)
const DEFAULT_PRICES: Record<string, number> = {
  ethereum: 3200,
  'matic-network': 0.85,
  binancecoin: 300,
  'avalanche-2': 35,
  fantom: 0.45,
  zetachain: 0.75,
};

// CoinGecko API URL for fetching prices
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';

// Format number as USD currency
const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

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
  const { proposals } = useGovernanceStore();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [realBalance, setRealBalance] = useState<string>('0.00');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [realStakingData, setRealStakingData] = useState({ stake: '0', rewards: '0' });
  const [isLoadingStaking, setIsLoadingStaking] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>(DEFAULT_PRICES);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  // Track detected chainId from wallet
  const [detectedChainId, setDetectedChainId] = useState<number>(1);

  // Detect chain ID from connected wallet on mount and when wallet changes
  useEffect(() => {
    const detectChainId = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;

      try {
        // Get chain ID directly from wallet
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' }) as string;
        const chainId = parseInt(chainIdHex, 16);
        console.log('Detected chain ID from wallet:', chainId);
        setDetectedChainId(chainId);
      } catch (error) {
        console.error('Failed to detect chain ID:', error);
        setDetectedChainId(1); // Default to Ethereum mainnet
      }
    };

    detectChainId();

    // Listen for chain changes
    if (window.ethereum?.on) {
      const handleChainChanged = (chainIdHex: string) => {
        const chainId = parseInt(chainIdHex, 16);
        console.log('Chain changed to:', chainId);
        setDetectedChainId(chainId);
      };
      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
      };
    }
  }, [wallet?.address]);

  // Get effective chain ID (prefer detected, fallback to stored, then default to 1)
  const getEffectiveChainId = (): number => {
    // First try the detected chainId from the wallet
    if (detectedChainId && detectedChainId !== 31337) {
      return detectedChainId;
    }
    // Then try wallet store chainId
    const storedChainId = wallet?.chainId as number;
    if (storedChainId && storedChainId !== 31337 && storedChainId !== 0) {
      return storedChainId;
    }
    // Default to Ethereum mainnet
    return 1;
  };

  // Fetch real wallet balance from blockchain
  // Uses direct RPC provider for reliable read-only operations (doesn't depend on wallet connection state)
  useEffect(() => {
    const fetchRealBalance = async () => {
      if (!wallet?.address) return;

      setIsLoadingBalance(true);
      try {
        // Use effective chainId to ensure we're querying the correct network
        const chainId = getEffectiveChainId();
        console.log('Fetching balance for chain:', chainId, 'address:', wallet.address);
        const provider = getReadOnlyProvider(chainId);
        const balance = await provider.getBalance(wallet.address);
        const balanceInEth = ethers.formatEther(balance);
        console.log('Balance fetched:', balanceInEth);
        setRealBalance(balanceInEth);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setRealBalance('0.00');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchRealBalance();
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchRealBalance, 30000);
    return () => clearInterval(interval);
  }, [wallet?.address, detectedChainId]);

  // Fetch real staking data from ValidatorRegistry contract
  useEffect(() => {
    const fetchStakingData = async () => {
      if (!wallet?.address) return;

      setIsLoadingStaking(true);
      try {
        const data = await getUserValidatorInfo(wallet.address);
        setRealStakingData({ stake: data.stake, rewards: data.rewards });
      } catch (error) {
        console.error('Failed to fetch staking data:', error);
        setRealStakingData({ stake: '0', rewards: '0' });
      } finally {
        setIsLoadingStaking(false);
      }
    };

    fetchStakingData();
    // Refresh staking data every 30 seconds
    const interval = setInterval(fetchStakingData, 30000);
    return () => clearInterval(interval);
  }, [wallet?.address]);

  // Fetch real-time token prices from CoinGecko
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      try {
        // Get unique CoinGecko IDs from all supported chains
        const coingeckoIds = [...new Set(Object.values(CHAIN_TOKEN_CONFIG).map(c => c.coingeckoId))];
        const idsParam = coingeckoIds.join(',');

        const response = await fetch(
          `${COINGECKO_API_URL}?ids=${idsParam}&vs_currencies=usd`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform response to our price format
        const prices: Record<string, number> = {};
        for (const [id, priceData] of Object.entries(data)) {
          prices[id] = (priceData as { usd: number }).usd;
        }

        setTokenPrices(prices);
        console.log('Token prices updated:', prices);
      } catch (error) {
        console.error('Failed to fetch token prices:', error);
        // Keep using default prices on error
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchPrices();
    // Refresh prices every 60 seconds (CoinGecko rate limits)
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to get current token price based on chain
  const getTokenPrice = (chainId: number): number => {
    const config = CHAIN_TOKEN_CONFIG[chainId] || CHAIN_TOKEN_CONFIG[1];
    return tokenPrices[config.coingeckoId] || DEFAULT_PRICES[config.coingeckoId] || 0;
  };

  useEffect(() => {
    if (wallet) {
      const activeTransfersCount = transfers.filter((t) =>
        t.status === 'pending' || t.status === 'processing'
      ).length;

      const chainId = getEffectiveChainId();
      const currentPrice = getTokenPrice(chainId);
      const balanceInUSD = parseFloat(realBalance) * currentPrice;
      // Staking is always in ETH
      const ethPrice = tokenPrices['ethereum'] || DEFAULT_PRICES['ethereum'];
      const stakeInUSD = parseFloat(realStakingData.stake) * ethPrice;
      const rewardsInUSD = parseFloat(realStakingData.rewards) * ethPrice;

      setStats([
        {
          label: 'Wallet Balance',
          value: isLoadingBalance ? 'Loading...' : formatUSD(balanceInUSD),
          change: '',
          icon: '💰',
          color: 'from-blue-500 to-blue-600',
        },
        {
          label: 'Total Staked',
          value: isLoadingStaking ? 'Loading...' : formatUSD(stakeInUSD),
          change: '',
          icon: '📈',
          color: 'from-green-500 to-green-600',
        },
        {
          label: 'Rewards Earned',
          value: isLoadingStaking ? 'Loading...' : formatUSD(rewardsInUSD),
          change: '',
          icon: '🎁',
          color: 'from-purple-500 to-purple-600',
        },
        {
          label: 'Active Transfers',
          value: activeTransfersCount.toString(),
          change: '',
          icon: '🔄',
          color: 'from-orange-500 to-orange-600',
        },
      ]);
    }
  }, [wallet, transfers, realBalance, isLoadingBalance, realStakingData, isLoadingStaking, tokenPrices, detectedChainId]);

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
    <div className="container px-4 sm:px-6 md:px-8 mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to ChainSync. Your cross-chain settlement hub.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="text-left sm:text-right w-full sm:w-auto">
            <p className="text-sm text-gray-600">Connected Wallet</p>
            <p className="text-sm sm:text-lg font-mono font-semibold text-gray-900 break-words">{formatAddress(wallet.address)}</p>
          </div>
          <div className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              className="w-full sm:w-auto"
            >
              Disconnect
            </Button>
          </div>
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
            {stat.change && (
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
                <span className="text-gray-500 text-sm">from last month</span>
              </div>
            )}
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
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {isLoadingStaking || isLoadingPrices ? 'Loading...' : formatUSD(parseFloat(realStakingData.stake) * (tokenPrices['ethereum'] || DEFAULT_PRICES['ethereum']))}
                </p>
                <p className="text-sm text-gray-500">
                  {isLoadingStaking ? '' : `${parseFloat(realStakingData.stake).toFixed(6)} ETH`}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Unclaimed Rewards</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {isLoadingStaking || isLoadingPrices ? 'Loading...' : formatUSD(parseFloat(realStakingData.rewards) * (tokenPrices['ethereum'] || DEFAULT_PRICES['ethereum']))}
                </p>
                <p className="text-sm text-gray-500">
                  {isLoadingStaking ? '' : `${parseFloat(realStakingData.rewards).toFixed(6)} ETH`}
                </p>
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
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {(() => {
                const chainId = getEffectiveChainId();
                const config = CHAIN_TOKEN_CONFIG[chainId];
                if (config) return config.name;
                if (chainId === 1) return 'Ethereum Mainnet';
                if (chainId === 137) return 'Polygon';
                if (chainId === 42161) return 'Arbitrum';
                if (chainId === 10) return 'Optimism';
                return `Chain ${chainId}`;
              })()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Balance</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {isLoadingBalance || isLoadingPrices ? 'Loading...' : formatUSD(parseFloat(realBalance) * getTokenPrice(getEffectiveChainId()))}
            </p>
            <p className="text-xs text-gray-500">
              {isLoadingBalance ? '' : `${parseFloat(realBalance).toFixed(4)} ${CHAIN_TOKEN_CONFIG[getEffectiveChainId()]?.symbol || 'ETH'}`}
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
