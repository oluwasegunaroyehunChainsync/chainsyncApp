import { useState, useEffect } from 'react';
import { useWalletStore, useTransferStore, notify } from '@/stores';
import { SUPPORTED_CHAINS, SUPPORTED_ASSETS, CONTRACT_ADDRESSES, getTokenAddressForChain } from '@/constants';
import { ChainId } from '@/types';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import TransactionProgressDrawer from '@/components/TransactionProgressDrawer';
import {
  approveToken,
  checkAllowance,
  executeSameChainTransfer,
  executeCrossChainTransfer,
  setCurrentChainId,
  getContractAddresses,
} from '@/utils/web3';
import { ethers } from 'ethers';
import { apiClient } from '@/lib/api';

// Filter chains that have deployed contracts
const TESTNET_CHAINS = Object.entries(SUPPORTED_CHAINS).filter(
  ([id]) => CONTRACT_ADDRESSES[Number(id)]
);

// Chain-specific token availability mapping
// Each chain ID maps to an array of token symbols available on that chain
const CHAIN_TOKENS: Record<number, string[]> = {
  // Ethereum Mainnet - All tokens available
  1: ['CST', 'WETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK', 'UNI', 'AAVE'],
  // Base Mainnet - Limited tokens (USDC is native, no USDT)
  8453: ['CST', 'USDC'],
  // BSC Mainnet - Binance-Peg tokens
  56: ['CST', 'USDC', 'USDT'],
  // Polygon - Not yet deployed but ready
  137: ['CST', 'USDC', 'USDT', 'DAI', 'WETH'],
  // Arbitrum - Not yet deployed but ready
  42161: ['CST', 'USDC', 'USDT', 'DAI', 'WETH'],
  // Testnets - CST only for testing
  11155111: ['CST'], // Sepolia
  421614: ['CST'],   // Arbitrum Sepolia
  31337: ['CST'],    // Hardhat local
};

// Get tokens available on a specific chain
const getChainTokens = (chainId: number): string[] => {
  return CHAIN_TOKENS[chainId] || ['CST']; // Default to CST if chain not configured
};

// Get valid destination chains for a specific token
// Returns chain IDs that support the given token
const getValidDestinationChains = (tokenSymbol: string): number[] => {
  const validChains: number[] = [];
  for (const [chainIdStr, tokens] of Object.entries(CHAIN_TOKENS)) {
    const chainId = Number(chainIdStr);
    // Only include chains that have deployed contracts
    if (CONTRACT_ADDRESSES[chainId] && tokens.includes(tokenSymbol)) {
      validChains.push(chainId);
    }
  }
  return validChains;
};

// CoinGecko IDs for supported assets
const ASSET_COINGECKO_IDS: Record<string, string> = {
  CST: 'ethereum', // CST tracks ETH price for now
  WETH: 'ethereum',
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI: 'dai',
  WBTC: 'bitcoin',
  LINK: 'chainlink',
  UNI: 'uniswap',
  AAVE: 'aave',
};

// Default prices as fallback
const DEFAULT_PRICES: Record<string, number> = {
  ethereum: 3200,
  'usd-coin': 1,
  tether: 1,
  dai: 1,
  bitcoin: 95000,
  chainlink: 15,
  uniswap: 8,
  aave: 180,
};

// CoinGecko API URL
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';

export default function Transfer() {
  const { wallet } = useWalletStore();
  const {
    initiateCrossChainTransfer,
    initiateSameChainTransfer,
    isLoading,
    activeProgress,
    isProgressDrawerOpen,
    closeProgressDrawer,
    startTransactionProgress,
    simulateProgressSteps,
  } = useTransferStore();
  const [sourceChain, setSourceChain] = useState<ChainId>(1 as ChainId); // Default to Ethereum Mainnet
  const [destChain, setDestChain] = useState<ChainId>(1 as ChainId); // Default to Ethereum Mainnet (same-chain transfer)
  const [asset, setAsset] = useState('CST'); // Default to CST token for testing
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false); // Local guard to prevent double execution
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>(DEFAULT_PRICES);

  // Fetch token prices from CoinGecko
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const coinIds = Object.values(ASSET_COINGECKO_IDS).filter((v, i, a) => a.indexOf(v) === i).join(',');
        const response = await fetch(`${COINGECKO_API_URL}?ids=${coinIds}&vs_currencies=usd`);
        if (response.ok) {
          const data = await response.json();
          const prices: Record<string, number> = {};
          Object.entries(data).forEach(([id, priceData]: [string, any]) => {
            prices[id] = priceData.usd;
          });
          setTokenPrices(prices);
        }
      } catch (error) {
        console.error('Failed to fetch token prices:', error);
        // Keep using default prices on error
      }
    };

    fetchPrices();
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update web3 utility with current chain when source chain changes
  useEffect(() => {
    setCurrentChainId(Number(sourceChain));
  }, [sourceChain]);

  // Reset asset selection when chain changes if current asset is not available
  useEffect(() => {
    const availableTokens = getChainTokens(Number(sourceChain));
    if (!availableTokens.includes(asset)) {
      // Set to first available token on the new chain
      setAsset(availableTokens[0] || 'CST');
    }
  }, [sourceChain, asset]);

  // Reset destination chain when asset changes if destination doesn't support the asset
  useEffect(() => {
    const validDestChains = getValidDestinationChains(asset);
    if (!validDestChains.includes(Number(destChain))) {
      // Set to source chain (same-chain transfer) or first valid destination
      if (validDestChains.includes(Number(sourceChain))) {
        setDestChain(sourceChain);
      } else if (validDestChains.length > 0) {
        setDestChain(validDestChains[0] as ChainId);
      }
    }
  }, [asset, sourceChain, destChain]);

  // Get USD value for current amount and asset
  const getUsdValue = (tokenAmount: string, tokenSymbol: string): string => {
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) return '0.00';
    const coingeckoId = ASSET_COINGECKO_IDS[tokenSymbol] || 'ethereum';
    const price = tokenPrices[coingeckoId] || DEFAULT_PRICES[coingeckoId] || 0;
    const usdValue = parseFloat(tokenAmount) * price;
    return usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleTransfer = async () => {
    // Prevent double execution
    if (isTransferring) {
      console.log('Transfer already in progress, ignoring duplicate call');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      notify.error('Please enter a valid amount');
      return;
    }

    if (!recipientAddress) {
      notify.error('Please enter a recipient address');
      return;
    }

    if (!wallet?.address) {
      notify.error('Please connect your wallet first');
      return;
    }

    // Set local guard immediately
    setIsTransferring(true);

    // Get contract address for the source chain
    const contractAddresses = getContractAddresses(Number(sourceChain));

    try {
      // Get token address - use chain-specific address for all tokens
      // Each chain has different contract addresses for the same token (e.g., USDC on Base vs Ethereum)
      const tokenAddress = getTokenAddressForChain(asset, Number(sourceChain));
      console.log(`Using token address for ${asset} on chain ${sourceChain}: ${tokenAddress}`);

      // Format amount to ensure it's a valid decimal string (e.g., "5" or "5.0")
      const formattedAmount = parseFloat(amount).toString();

      // Step 1: Create transfer record in backend (for tracking)
      notify.info('Creating transfer record...');
      let transferRecord;
      if (sourceChain === destChain) {
        transferRecord = await initiateSameChainTransfer(
          Number(sourceChain),
          tokenAddress,
          formattedAmount,
          recipientAddress,
          contractAddresses.chainSync
        );
      } else {
        transferRecord = await initiateCrossChainTransfer(
          Number(sourceChain),
          Number(destChain),
          tokenAddress,
          formattedAmount,
          recipientAddress,
          contractAddresses.chainSync
        );
      }

      // Step 2: Check token allowance
      notify.info('Checking token allowance...');
      // Use correct decimals for each token (USDT/USDC = 6, others = 18)
      const tokenDecimals = SUPPORTED_ASSETS[asset as keyof typeof SUPPORTED_ASSETS]?.decimals || 18;
      const amountBigInt = ethers.parseUnits(formattedAmount, tokenDecimals);
      const allowance = await checkAllowance(tokenAddress, wallet.address, contractAddresses.chainSync);

      // Step 3: Approve token if needed
      if (allowance < amountBigInt) {
        notify.info('Please approve token spending in MetaMask...');
        await approveToken(tokenAddress, formattedAmount, contractAddresses.chainSync);
        notify.success('Token approval confirmed!');
      }

      // Step 4: Execute blockchain transaction (user signs via MetaMask)
      notify.info('Please confirm the transfer in MetaMask...');
      let txHash: string;

      if (sourceChain === destChain) {
        txHash = await executeSameChainTransfer(tokenAddress, recipientAddress, formattedAmount, tokenDecimals);
      } else {
        txHash = await executeCrossChainTransfer(tokenAddress, recipientAddress, formattedAmount, Number(destChain), tokenDecimals);
      }

      notify.success(`Transfer submitted! Transaction: ${txHash.substring(0, 10)}...`);

      // Step 5: Update backend with transaction hash
      if (transferRecord?.id) {
        await apiClient.updateTransferStatus(transferRecord.id, 'CONFIRMED', txHash);
      }

      // Step 6: Start progress tracking drawer for all transfers
      const isSameChain = sourceChain === destChain;
      startTransactionProgress({
        id: transferRecord?.id || txHash,
        amount: formattedAmount,
        asset,
        sourceChain: sourceChainName,
        destinationChain: isSameChain ? sourceChainName : destChainName,
        isSameChain,
      });
      // Start simulating progress steps (in production, this would be replaced with real websocket updates)
      simulateProgressSteps();

      setAmount('');
      setRecipientAddress('');
    } catch (error: any) {
      console.error('Transfer error:', error);

      // Handle user rejection
      if (error?.code === 4001 || error?.message?.includes('user rejected')) {
        notify.error('Transaction rejected by user');
        return;
      }

      // Show the actual error message
      const errorMessage = error?.response?.data?.message || error?.message || 'Transfer failed. Please try again.';
      notify.error(errorMessage);
    } finally {
      // Always reset the guard
      setIsTransferring(false);
    }
  };

  const sourceChainName = SUPPORTED_CHAINS[sourceChain as keyof typeof SUPPORTED_CHAINS]?.name || 'Unknown';
  const destChainName = SUPPORTED_CHAINS[destChain as keyof typeof SUPPORTED_CHAINS]?.name || 'Unknown';
  const fee = amount ? (parseFloat(amount) * 0.001).toFixed(6) : '0';
  const total = amount ? (parseFloat(amount) + parseFloat(fee)).toFixed(6) : '0';

  return (
    <div className="container px-4 sm:px-6 md:px-8 mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cross-Chain Transfer</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Transfer assets across blockchains with atomic settlement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Initiate Transfer</h2>
            </Card.Header>
            <Card.Body className="space-y-6">
              {/* Source Chain */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">From Chain</label>
                <select
                  value={sourceChain}
                  onChange={(e) => setSourceChain(Number(e.target.value) as ChainId)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {TESTNET_CHAINS.map(([id, chain]) => (
                    <option key={id} value={id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Selection - Filtered by selected chain */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Asset</label>
                <select
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(SUPPORTED_ASSETS)
                    .filter(([symbol]) => getChainTokens(Number(sourceChain)).includes(symbol))
                    .map(([symbol, assetData]) => (
                      <option key={symbol} value={symbol}>
                        {symbol} - {assetData.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Showing tokens available on {SUPPORTED_CHAINS[sourceChain as keyof typeof SUPPORTED_CHAINS]?.name || 'selected chain'}
                </p>
              </div>

              {/* Amount */}
              <div>
                <Input
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  suffix={asset}
                />
                {amount && parseFloat(amount) > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ≈ <span className="font-semibold text-green-600 dark:text-green-400">${getUsdValue(amount, asset)}</span> USD
                  </p>
                )}
              </div>

              {/* Recipient Address */}
              <Input
                label="Recipient Address"
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                helperText="The address that will receive the assets on the destination chain"
              />

              {/* Destination Chain - Filtered by selected asset */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">To Chain</label>
                <select
                  value={destChain}
                  onChange={(e) => setDestChain(Number(e.target.value) as ChainId)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {TESTNET_CHAINS
                    .filter(([id]) => getValidDestinationChains(asset).includes(Number(id)))
                    .map(([id, chain]) => (
                      <option key={id} value={id}>
                        {chain.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Chains that support {asset}
                </p>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading || isTransferring}
                disabled={isLoading || isTransferring}
                onClick={handleTransfer}
                className="w-full md:w-auto"
              >
                {(isLoading || isTransferring) ? 'Processing...' : 'Initiate Transfer'}
              </Button>
            </Card.Body>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card variant="elevated">
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transfer Summary</h2>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">From</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{sourceChainName}</p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">To</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{destChainName}</p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Amount</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{amount || '0'} {asset}</p>
                {amount && parseFloat(amount) > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">≈ ${getUsdValue(amount, asset)} USD</p>
                )}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Network Fee (0.1%)</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{fee} {asset}</p>
                {parseFloat(fee) > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">≈ ${getUsdValue(fee, asset)} USD</p>
                )}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 bg-blue-50 dark:bg-blue-900/30 -mx-4 -mb-4 px-4 py-4 rounded-b-lg">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Cost</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{total} {asset}</p>
                {parseFloat(total) > 0 && (
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium mt-0.5">≈ ${getUsdValue(total, asset)} USD</p>
                )}
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Estimated Time</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">~2-5 minutes</p>
              </div>
            </Card.Body>
          </Card>

          <Card variant="outlined">
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Wallet Info</h2>
            </Card.Header>
            <Card.Body className="space-y-3">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Connected Wallet</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white mt-1 break-all">{wallet?.address ? wallet.address.slice(0, 10) : 'Not connected'}...</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Available Balance</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{wallet?.balance || '0'} ETH</p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="outlined">
          <Card.Body className="space-y-2">
            <p className="text-2xl">🔒</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Secure</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Non-custodial transfers with cryptographic verification</p>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Body className="space-y-2">
            <p className="text-2xl">⚡</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Fast</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Atomic settlement across chains in minutes</p>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Body className="space-y-2">
            <p className="text-2xl">💰</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Cheap</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Minimal fees with transparent pricing</p>
          </Card.Body>
        </Card>
      </div>

      {/* Transaction Progress Drawer */}
      <TransactionProgressDrawer
        isOpen={isProgressDrawerOpen}
        onClose={closeProgressDrawer}
        transaction={activeProgress}
      />
    </div>
  );
}
