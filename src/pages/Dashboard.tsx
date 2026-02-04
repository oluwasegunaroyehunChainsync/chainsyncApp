import { useEffect, useState } from 'react';
import { useWalletStore, useTransferStore, useGovernanceStore } from '@/stores';
import { formatAddress } from '@/utils';
import { getReadOnlyProvider, getUserValidatorInfo } from '@/utils/web3';
import { ethers } from 'ethers';
import Card from '@/components/Card';
import Button from '@/components/Button';

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// Token address to symbol mapping for display
const TOKEN_ADDRESS_TO_SYMBOL: Record<string, string> = {
  // Ethereum Mainnet
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 'WETH',
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 'WBTC',
  '0x514910771AF9Ca656af840dff83E8264EcF986CA': 'LINK',
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': 'UNI',
  '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9': 'AAVE',
  '0xD2eb148c2ccb54e88F21529Aec74dd7ce2232b06': 'CST',
  // Base Mainnet
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 'USDC',
  '0x4200000000000000000000000000000000000006': 'WETH',
  '0xc2B916B687D97f9D7F5aB66d3E9F3C09Bd65F55F': 'CST',
  // BSC Mainnet
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': 'USDC',
  '0x55d398326f99059fF775485246999027B3197955': 'USDT',
  '0x674B6ac6c6505CAf4E7C5203CCF58370B5Fa2839': 'CST',
  // Polygon
  '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359': 'USDC',
  '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': 'USDC.e',
  '0xc2132D05D31c914a87C6611C10748AEb04B58e8F': 'USDT',
  // Arbitrum
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 'USDC',
  '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8': 'USDC.e',
  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': 'USDT',
  '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': 'WETH',
};

// Convert token address to symbol for display
const getTokenSymbol = (addressOrSymbol: string): string => {
  // If it's already a symbol (not an address), return as is
  if (!addressOrSymbol.startsWith('0x')) {
    return addressOrSymbol;
  }
  // Look up in mapping (case-insensitive)
  const symbol = TOKEN_ADDRESS_TO_SYMBOL[addressOrSymbol] ||
                 TOKEN_ADDRESS_TO_SYMBOL[addressOrSymbol.toLowerCase()];
  if (symbol) return symbol;
  // Return shortened address if not found
  return `${addressOrSymbol.slice(0, 6)}...${addressOrSymbol.slice(-4)}`;
};

// Map blockchain transfer statuses to user-friendly display
const getDisplayStatus = (status: string): { label: string; color: string } => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'completed':
    case 'relayed':
      return { label: 'Completed', color: 'bg-green-100 text-green-800' };
    case 'pending':
    case 'initiated':
      return { label: 'Initiated', color: 'bg-blue-100 text-blue-800' };
    case 'locked':
    case 'processing':
      return { label: 'Processing', color: 'bg-yellow-100 text-yellow-800' };
    case 'failed':
    case 'error':
      return { label: 'Failed', color: 'bg-red-100 text-red-800' };
    default:
      return { label: status.charAt(0).toUpperCase() + status.slice(1), color: 'bg-gray-100 text-gray-800' };
  }
};

// Token balance interface with chain info
interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  address: string;
  usdValue: number;
  chainId: number;
  chainName: string;
}

// Chain-specific token addresses for balance checking
const CHAIN_TOKEN_ADDRESSES: Record<number, Record<string, { address: string; name: string; decimals: number; coingeckoId: string }>> = {
  // Ethereum Mainnet
  1: {
    WETH: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
    USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether USD', decimals: 6, coingeckoId: 'tether' },
    DAI: { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai Stablecoin', decimals: 18, coingeckoId: 'dai' },
    WBTC: { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', name: 'Wrapped Bitcoin', decimals: 8, coingeckoId: 'bitcoin' },
    LINK: { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', name: 'Chainlink', decimals: 18, coingeckoId: 'chainlink' },
    UNI: { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', name: 'Uniswap', decimals: 18, coingeckoId: 'uniswap' },
    AAVE: { address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', name: 'Aave', decimals: 18, coingeckoId: 'aave' },
  },
  // Arbitrum One
  42161: {
    ARB: { address: '0x912CE59144191C1204E64559FE8253a0e49E6548', name: 'Arbitrum', decimals: 18, coingeckoId: 'arbitrum' },
    USDC: { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    'USDC.e': { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', name: 'Bridged USDC', decimals: 6, coingeckoId: 'usd-coin' },
    USDT: { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', name: 'Tether USD', decimals: 6, coingeckoId: 'tether' },
    WETH: { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
    DAI: { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', name: 'Dai Stablecoin', decimals: 18, coingeckoId: 'dai' },
  },
  // Base Mainnet
  8453: {
    USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    WETH: { address: '0x4200000000000000000000000000000000000006', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
  },
  // BSC Mainnet
  56: {
    USDC: { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', name: 'USD Coin', decimals: 18, coingeckoId: 'usd-coin' },
    USDT: { address: '0x55d398326f99059fF775485246999027B3197955', name: 'Tether USD', decimals: 18, coingeckoId: 'tether' },
    BUSD: { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', name: 'Binance USD', decimals: 18, coingeckoId: 'binance-usd' },
  },
  // Polygon Mainnet
  137: {
    USDC: { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    'USDC.e': { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', name: 'Bridged USDC', decimals: 6, coingeckoId: 'usd-coin' },
    USDT: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', name: 'Tether USD', decimals: 6, coingeckoId: 'tether' },
    WETH: { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
    WMATIC: { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', name: 'Wrapped Matic', decimals: 18, coingeckoId: 'matic-network' },
  },
};

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
  const { transfers, fetchTransferHistory } = useTransferStore();
  const { proposals } = useGovernanceStore();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [realBalance, setRealBalance] = useState<string>('0.00');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [realStakingData, setRealStakingData] = useState({ stake: '0', rewards: '0' });
  const [isLoadingStaking, setIsLoadingStaking] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>(DEFAULT_PRICES);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

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
        // Use effective chainId to query the correct network
        const chainId = getEffectiveChainId();
        console.log('Fetching staking data for chain:', chainId);
        const data = await getUserValidatorInfo(wallet.address, chainId);
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
  }, [wallet?.address, detectedChainId]);

  // Fetch ERC20 token balances across ALL chains for the connected wallet
  useEffect(() => {
    const fetchAllChainBalances = async () => {
      if (!wallet?.address) return;

      setIsLoadingTokens(true);
      const allBalances: TokenBalance[] = [];

      console.log('Fetching token balances across all chains for:', wallet.address);

      // Query all chains in parallel
      const chainPromises = Object.entries(CHAIN_TOKEN_ADDRESSES).map(async ([chainIdStr, chainTokens]) => {
        const chainId = parseInt(chainIdStr);
        const chainConfig = CHAIN_TOKEN_CONFIG[chainId];
        const chainName = chainConfig?.name || `Chain ${chainId}`;

        try {
          const provider = getReadOnlyProvider(chainId);

          // Also fetch native token balance for this chain
          try {
            const nativeBalance = await provider.getBalance(wallet.address);
            const formattedNative = ethers.formatEther(nativeBalance);
            if (parseFloat(formattedNative) > 0.000001) {
              const nativePrice = tokenPrices[chainConfig?.coingeckoId || 'ethereum'] || 1;
              allBalances.push({
                symbol: chainConfig?.symbol || 'ETH',
                name: `${chainConfig?.symbol || 'ETH'} (Native)`,
                balance: formattedNative,
                decimals: 18,
                address: 'native',
                usdValue: parseFloat(formattedNative) * nativePrice,
                chainId,
                chainName,
              });
            }
          } catch (err) {
            console.error(`Failed to fetch native balance on ${chainName}:`, err);
          }

          // Fetch ERC20 token balances
          for (const [symbol, tokenInfo] of Object.entries(chainTokens)) {
            try {
              const contract = new ethers.Contract(tokenInfo.address, ERC20_ABI, provider);
              const balance = await contract.balanceOf(wallet.address);
              const formattedBalance = ethers.formatUnits(balance, tokenInfo.decimals);

              if (parseFloat(formattedBalance) > 0.000001) {
                const price = tokenPrices[tokenInfo.coingeckoId] || 1;
                allBalances.push({
                  symbol,
                  name: tokenInfo.name,
                  balance: formattedBalance,
                  decimals: tokenInfo.decimals,
                  address: tokenInfo.address,
                  usdValue: parseFloat(formattedBalance) * price,
                  chainId,
                  chainName,
                });
              }
            } catch (err) {
              // Silently skip failed token queries
            }
          }
        } catch (err) {
          console.error(`Failed to query chain ${chainName}:`, err);
        }
      });

      try {
        await Promise.all(chainPromises);
        // Sort by USD value (highest first)
        allBalances.sort((a, b) => b.usdValue - a.usdValue);
        setTokenBalances(allBalances);
        console.log('Total tokens found across all chains:', allBalances.length);
      } catch (error) {
        console.error('Failed to fetch multi-chain balances:', error);
        setTokenBalances([]);
      } finally {
        setIsLoadingTokens(false);
      }
    };

    fetchAllChainBalances();
    // Refresh token balances every 60 seconds (longer interval due to multiple RPC calls)
    const interval = setInterval(fetchAllChainBalances, 60000);
    return () => clearInterval(interval);
  }, [wallet?.address, tokenPrices]);

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

  // Poll for transfer status updates
  useEffect(() => {
    // Initial fetch
    fetchTransferHistory();

    // Check if there are any pending/processing transfers that need status updates
    const hasPendingTransfers = transfers.some(t =>
      ['pending', 'initiated', 'locked', 'processing'].includes(t.status.toLowerCase())
    );

    // Poll more frequently if there are pending transfers
    const pollInterval = hasPendingTransfers ? 15000 : 60000; // 15s if pending, 60s otherwise

    const interval = setInterval(() => {
      fetchTransferHistory();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchTransferHistory, transfers.length]);

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

      {/* Multi-Chain Token Balances - Portfolio View */}
      <Card variant="elevated">
        <Card.Header>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Your Portfolio (All Networks)</h2>
            <span className="text-sm text-gray-500">
              {tokenBalances.length} tokens across {new Set(tokenBalances.map(t => t.chainId)).size} networks
            </span>
          </div>
        </Card.Header>
        <Card.Body>
          {isLoadingTokens ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <p className="text-gray-600">Scanning all networks for tokens...</p>
                <p className="text-sm text-gray-400 mt-2">Checking Ethereum, Arbitrum, Base, BSC, Polygon...</p>
              </div>
            </div>
          ) : tokenBalances.length > 0 ? (
            <>
              {/* Token List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tokenBalances.map((token, index) => (
                  <div key={`${token.chainId}-${token.symbol}-${index}`} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          token.address === 'native'
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            : 'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`}>
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{token.symbol}</p>
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              {token.chainName}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {parseFloat(token.balance).toFixed(token.decimals === 6 ? 2 : 4)}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          {formatUSD(token.usdValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Portfolio Value */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 font-medium">Total Portfolio Value</p>
                    <p className="text-xs text-gray-400">Across all networks</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatUSD(tokenBalances.reduce((sum, t) => sum + t.usdValue, 0))}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No tokens found</p>
              <p className="text-sm mt-1">We scanned Ethereum, Arbitrum, Base, BSC, and Polygon</p>
              <p className="text-sm">Tokens will appear here when you have a balance</p>
            </div>
          )}
        </Card.Body>
      </Card>

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
                      {recentTransfers.map((transfer) => {
                        const displayStatus = getDisplayStatus(transfer.status);
                        return (
                          <tr key={transfer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-semibold text-gray-900">{getTokenSymbol(transfer.asset)}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-900">{transfer.amount}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${displayStatus.color}`}>
                                {displayStatus.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-sm">
                              {new Date(transfer.timestamp).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {transfer.sourceHash && (
                                <a
                                  href={`https://etherscan.io/tx/${transfer.sourceHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  View
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
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
            <button type="button" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
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
            <p className="text-gray-600 text-sm">Native Balance</p>
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
