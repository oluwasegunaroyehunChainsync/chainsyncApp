import { useState, useEffect } from 'react';
import { useWalletStore, useTransferStore, notify } from '@/stores';
import { SUPPORTED_CHAINS, SUPPORTED_ASSETS, CONTRACT_ADDRESSES, getCSTTokenAddress } from '@/constants';
import { ChainId } from '@/types';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
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

export default function Transfer() {
  const { wallet } = useWalletStore();
  const { initiateCrossChainTransfer, initiateSameChainTransfer, isLoading } = useTransferStore();
  const [sourceChain, setSourceChain] = useState<ChainId>(1 as ChainId); // Default to Ethereum Mainnet
  const [destChain, setDestChain] = useState<ChainId>(1 as ChainId); // Default to Ethereum Mainnet (same-chain transfer)
  const [asset, setAsset] = useState('CST'); // Default to CST token for testing
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false); // Local guard to prevent double execution

  // Update web3 utility with current chain when source chain changes
  useEffect(() => {
    setCurrentChainId(Number(sourceChain));
  }, [sourceChain]);

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
      // Get token address - use chain-specific address for CST
      let tokenAddress: string;
      if (asset === 'CST') {
        tokenAddress = getCSTTokenAddress(Number(sourceChain));
      } else {
        tokenAddress = SUPPORTED_ASSETS[asset as keyof typeof SUPPORTED_ASSETS]?.address || '0x0000000000000000000000000000000000000000';
      }

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
      const amountBigInt = ethers.parseEther(formattedAmount);
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
        txHash = await executeSameChainTransfer(tokenAddress, recipientAddress, formattedAmount);
      } else {
        txHash = await executeCrossChainTransfer(tokenAddress, recipientAddress, formattedAmount, Number(destChain));
      }

      notify.success(`Transfer submitted! Transaction: ${txHash.substring(0, 10)}...`);

      // Step 5: Update backend with transaction hash
      if (transferRecord?.id) {
        await apiClient.updateTransferStatus(transferRecord.id, 'CONFIRMED', txHash);
      }

      notify.success('Transfer completed successfully!');
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
        <h1 className="text-3xl font-bold text-gray-900">Cross-Chain Transfer</h1>
        <p className="text-gray-600 mt-1">Transfer assets across blockchains with atomic settlement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-900">Initiate Transfer</h2>
            </Card.Header>
            <Card.Body className="space-y-6">
              {/* Source Chain */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">From Chain</label>
                <select
                  value={sourceChain}
                  onChange={(e) => setSourceChain(Number(e.target.value) as ChainId)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TESTNET_CHAINS.map(([id, chain]) => (
                    <option key={id} value={id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Asset</label>
                <select
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(SUPPORTED_ASSETS).map(([symbol, assetData]) => (
                    <option key={symbol} value={symbol}>
                      {symbol} - {assetData.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <Input
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                suffix={asset}
              />

              {/* Recipient Address */}
              <Input
                label="Recipient Address"
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                helperText="The address that will receive the assets on the destination chain"
              />

              {/* Destination Chain */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">To Chain</label>
                <select
                  value={destChain}
                  onChange={(e) => setDestChain(Number(e.target.value) as ChainId)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TESTNET_CHAINS.map(([id, chain]) => (
                    <option key={id} value={id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
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
              <h2 className="text-xl font-bold text-gray-900">Transfer Summary</h2>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">From</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{sourceChainName}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-600 text-sm">To</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{destChainName}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-600 text-sm">Amount</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{amount || '0'} {asset}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-600 text-sm">Network Fee (0.1%)</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{fee} {asset}</p>
              </div>
              <div className="border-t border-gray-200 pt-4 bg-blue-50 -mx-4 -mb-4 px-4 py-4 rounded-b-lg">
                <p className="text-gray-600 text-sm">Total Cost</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{total} {asset}</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">Estimated Time</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">~2-5 minutes</p>
              </div>
            </Card.Body>
          </Card>

          <Card variant="outlined">
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-900">Wallet Info</h2>
            </Card.Header>
            <Card.Body className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Connected Wallet</p>
                <p className="text-sm font-mono text-gray-900 mt-1 break-all">{wallet?.address ? wallet.address.slice(0, 10) : 'Not connected'}...</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Available Balance</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{wallet?.balance || '0'} ETH</p>
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
            <h3 className="font-semibold text-gray-900">Secure</h3>
            <p className="text-sm text-gray-600">Non-custodial transfers with cryptographic verification</p>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Body className="space-y-2">
            <p className="text-2xl">⚡</p>
            <h3 className="font-semibold text-gray-900">Fast</h3>
            <p className="text-sm text-gray-600">Atomic settlement across chains in minutes</p>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Body className="space-y-2">
            <p className="text-2xl">💰</p>
            <h3 className="font-semibold text-gray-900">Cheap</h3>
            <p className="text-sm text-gray-600">Minimal fees with transparent pricing</p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
