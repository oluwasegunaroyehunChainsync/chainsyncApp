import { ethers } from 'ethers';

// Smart Contract ABIs
const CHAINSYNC_ABI = [
  'function transferSameChain(address token, address recipient, uint256 amount) external returns (bytes32)',
  'function initiateTransfer(address token, uint256 amount, uint256 destinationChain, address recipient) external returns (bytes32)',
  'function calculateFee(uint256 amount) external view returns (uint256)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
];

const VALIDATOR_REGISTRY_ABI = [
  'function getValidator(address validator) external view returns (address validatorAddress, uint256 stake, uint256 joinedAt, bool active, uint256 slashAmount)',
  'function getValidatorStake(address validator) external view returns (uint256)',
  'function isActiveValidator(address validator) external view returns (bool)',
  'function totalStaked() external view returns (uint256)',
  'function registerValidator() external payable',
  'function addStake() external payable',
  'function removeStake(uint256 amount) external',
];

// Contract addresses (from backend .env)
const CHAINSYNC_CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const VALIDATOR_REGISTRY_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

/**
 * Get the active wallet provider from the wallet store or window
 * This works with MetaMask, Trust Wallet, WalletConnect, Coinbase Wallet, Phantom, etc.
 * Any EIP-1193 compatible wallet will work
 */
export function getProvider(): ethers.BrowserProvider | null {
  if (typeof window === 'undefined') return null;

  // Check for injected provider (MetaMask, Trust Wallet, Phantom, etc.)
  // Priority order: window.ethereum is the standard
  let provider = window.ethereum;

  // If multiple wallets are installed, they might inject into different properties
  // But modern wallets use EIP-6963 or fallback to window.ethereum

  if (!provider) return null;

  return new ethers.BrowserProvider(provider);
}

/**
 * Get the user's signer (for signing transactions)
 * Works with any connected wallet
 */
export async function getSigner(): Promise<ethers.Signer | null> {
  const provider = getProvider();
  if (!provider) return null;
  return await provider.getSigner();
}

/**
 * Check if user has approved token spending
 */
export async function checkAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string = CHAINSYNC_CONTRACT_ADDRESS
): Promise<bigint> {
  const provider = getProvider();
  if (!provider) throw new Error('No Ethereum provider found');

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
  return allowance;
}

/**
 * Approve token spending
 */
export async function approveToken(
  tokenAddress: string,
  amount: string,
  spenderAddress: string = CHAINSYNC_CONTRACT_ADDRESS
): Promise<string> {
  const signer = await getSigner();
  if (!signer) throw new Error('No signer available');

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const amountBigInt = ethers.parseEther(amount);

  const tx = await tokenContract.approve(spenderAddress, amountBigInt);
  const receipt = await tx.wait();

  return receipt.hash;
}

/**
 * Execute same-chain transfer on blockchain
 */
export async function executeSameChainTransfer(
  tokenAddress: string,
  recipientAddress: string,
  amount: string
): Promise<string> {
  const signer = await getSigner();
  if (!signer) throw new Error('No signer available');

  const chainSyncContract = new ethers.Contract(
    CHAINSYNC_CONTRACT_ADDRESS,
    CHAINSYNC_ABI,
    signer
  );

  const amountBigInt = ethers.parseEther(amount);

  const tx = await chainSyncContract.transferSameChain(
    tokenAddress,
    recipientAddress,
    amountBigInt
  );

  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Execute cross-chain transfer on blockchain
 */
export async function executeCrossChainTransfer(
  tokenAddress: string,
  recipientAddress: string,
  amount: string,
  destinationChainId: number
): Promise<string> {
  const signer = await getSigner();
  if (!signer) throw new Error('No signer available');

  const chainSyncContract = new ethers.Contract(
    CHAINSYNC_CONTRACT_ADDRESS,
    CHAINSYNC_ABI,
    signer
  );

  const amountBigInt = ethers.parseEther(amount);

  const tx = await chainSyncContract.initiateTransfer(
    tokenAddress,
    amountBigInt,
    destinationChainId,
    recipientAddress
  );

  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Get token balance
 */
export async function getTokenBalance(
  tokenAddress: string,
  userAddress: string
): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No Ethereum provider found');

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await tokenContract.balanceOf(userAddress);

  return ethers.formatEther(balance);
}

/**
 * Calculate transfer fee
 */
export async function calculateTransferFee(amount: string): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No Ethereum provider found');

  const chainSyncContract = new ethers.Contract(
    CHAINSYNC_CONTRACT_ADDRESS,
    CHAINSYNC_ABI,
    provider
  );

  const amountBigInt = ethers.parseEther(amount);
  const fee = await chainSyncContract.calculateFee(amountBigInt);

  return ethers.formatEther(fee);
}

/**
 * Request account access (connect wallet)
 * Works with MetaMask, Trust Wallet, Coinbase Wallet, and other injected wallets
 * Note: For WalletConnect, use the WalletConnect provider initialization
 */
export async function requestAccounts(): Promise<string[]> {
  if (!window.ethereum) {
    throw new Error('No wallet detected. Please install MetaMask, Trust Wallet, or another Web3 wallet.');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  return accounts;
}

/**
 * Switch to a specific chain
 * Works with all EIP-1193 compatible wallets
 */
export async function switchChain(chainId: number): Promise<void> {
  if (!window.ethereum) {
    throw new Error('No wallet detected');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: any) {
    // Chain not added to wallet
    if (error.code === 4902) {
      throw new Error(`Chain ${chainId} is not added to your wallet. Please add it manually.`);
    }
    throw error;
  }
}

/**
 * Get user's staked amount in ValidatorRegistry
 */
export async function getUserStakedAmount(userAddress: string): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No provider available');

  const validatorRegistry = new ethers.Contract(
    VALIDATOR_REGISTRY_ADDRESS,
    VALIDATOR_REGISTRY_ABI,
    provider
  );

  try {
    const stake = await validatorRegistry.getValidatorStake(userAddress);
    return ethers.formatEther(stake);
  } catch (error) {
    console.error('Failed to fetch staked amount:', error);
    return '0';
  }
}

/**
 * Get user's validator info (including rewards estimation)
 */
export async function getUserValidatorInfo(userAddress: string): Promise<{
  stake: string;
  isActive: boolean;
  rewards: string;
}> {
  const provider = getProvider();
  if (!provider) throw new Error('No provider available');

  const validatorRegistry = new ethers.Contract(
    VALIDATOR_REGISTRY_ADDRESS,
    VALIDATOR_REGISTRY_ABI,
    provider
  );

  try {
    const isActive = await validatorRegistry.isActiveValidator(userAddress);
    const stake = await validatorRegistry.getValidatorStake(userAddress);

    // Simple rewards estimation: 12% APY
    // In production, this would come from the contract or backend
    const stakeInEth = parseFloat(ethers.formatEther(stake));
    const estimatedRewards = (stakeInEth * 0.12 / 365 * 30).toFixed(6); // ~1 month of rewards

    return {
      stake: ethers.formatEther(stake),
      isActive,
      rewards: isActive ? estimatedRewards : '0',
    };
  } catch (error) {
    console.error('Failed to fetch validator info:', error);
    return {
      stake: '0',
      isActive: false,
      rewards: '0',
    };
  }
}
