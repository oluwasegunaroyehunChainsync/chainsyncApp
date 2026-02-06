import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, SUPPORTED_CHAINS } from '@/constants';

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

// WETH contract ABI for wrapping/unwrapping ETH
const WETH_ABI = [
  'function deposit() external payable',
  'function withdraw(uint256 amount) external',
  'function balanceOf(address account) external view returns (uint256)',
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

// Default to Hardhat for backwards compatibility
const DEFAULT_CHAIN_ID = 31337;

// Track current connected chain
let currentChainId: number = DEFAULT_CHAIN_ID;

/**
 * Get contract addresses for a specific chain
 */
export function getContractAddresses(chainId: number = currentChainId) {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    console.warn(`No contract addresses for chain ${chainId}, falling back to Hardhat`);
    return CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID];
  }
  return addresses;
}

/**
 * Set the current chain ID (called when user switches networks)
 */
export function setCurrentChainId(chainId: number): void {
  currentChainId = chainId;
  console.log('Current chain ID set to:', chainId);
}

/**
 * Get the current chain ID
 */
export function getCurrentChainId(): number {
  return currentChainId;
}

/**
 * Get RPC URL for a chain
 */
export function getRpcUrl(chainId: number = currentChainId): string {
  const chain = SUPPORTED_CHAINS[chainId];
  return chain?.rpc || 'http://127.0.0.1:8545';
}

/**
 * EIP-1193 Provider Interface (for storing selected wallet)
 */
interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

/**
 * Stored selected wallet provider
 * This ensures we use the same wallet that the user connected with
 */
let selectedWalletProvider: EIP1193Provider | null = null;

/**
 * Set the selected wallet provider
 * Call this when the user connects their wallet
 */
export function setSelectedWalletProvider(provider: EIP1193Provider | null): void {
  selectedWalletProvider = provider;
  console.log('Selected wallet provider set:', provider ? 'yes' : 'no');
}

/**
 * Get the selected wallet provider
 */
export function getSelectedWalletProvider(): EIP1193Provider | null {
  return selectedWalletProvider;
}

/**
 * Get the active wallet provider
 * Uses the selected wallet provider if set, otherwise falls back to window.ethereum
 * This ensures signing requests go to the correct wallet
 */
export function getProvider(): ethers.BrowserProvider | null {
  if (typeof window === 'undefined') return null;

  // Use selected wallet provider if available (set during wallet connection)
  const provider = selectedWalletProvider || window.ethereum;

  if (!provider) return null;

  return new ethers.BrowserProvider(provider as any);
}

/**
 * Get the user's signer (for signing transactions)
 * Uses the selected wallet provider to ensure correct wallet is used
 */
export async function getSigner(): Promise<ethers.Signer | null> {
  const provider = getProvider();
  if (!provider) return null;
  return await provider.getSigner();
}

/**
 * Get a read-only provider for the current or specified chain
 * Uses direct RPC connection instead of wallet provider for reliability
 */
export function getReadOnlyProvider(chainId?: number): ethers.JsonRpcProvider {
  const rpcUrl = getRpcUrl(chainId || currentChainId);
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Check if user has approved token spending
 * Uses direct RPC connection for reliable read operations
 */
export async function checkAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress?: string
): Promise<bigint> {
  const addresses = getContractAddresses();
  const spender = spenderAddress || addresses.chainSync;

  // Use direct RPC provider for read-only operations
  // This avoids issues with MetaMask network switching
  const provider = getReadOnlyProvider();

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const allowance = await tokenContract.allowance(ownerAddress, spender);
  return allowance;
}

/**
 * Approve token spending
 * Approves max uint256 to avoid repeated approvals for each transfer
 * @param tokenAddress - The ERC20 token contract address
 * @param _amount - Unused, kept for backwards compatibility. Always approves max uint256.
 * @param spenderAddress - The address allowed to spend tokens (defaults to ChainSync contract)
 */
export async function approveToken(
  tokenAddress: string,
  _amount: string,
  spenderAddress?: string
): Promise<string> {
  const addresses = getContractAddresses();
  const spender = spenderAddress || addresses.chainSync;

  const signer = await getSigner();
  if (!signer) throw new Error('No signer available');

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

  // Approve max uint256 to avoid repeated approval popups
  // This is a common pattern for DeFi applications
  const maxApproval = ethers.MaxUint256;

  const tx = await tokenContract.approve(spender, maxApproval);
  const receipt = await tx.wait();

  return receipt.hash;
}

/**
 * Execute same-chain transfer on blockchain
 * @param tokenAddress - The ERC20 token contract address
 * @param recipientAddress - The recipient wallet address
 * @param amount - The amount to transfer (as a string, e.g., "2.5")
 * @param decimals - Token decimals (default 18, use 6 for USDT/USDC)
 */
export async function executeSameChainTransfer(
  tokenAddress: string,
  recipientAddress: string,
  amount: string,
  decimals: number = 18
): Promise<string> {
  const addresses = getContractAddresses();

  const signer = await getSigner();
  if (!signer) throw new Error('No signer available');

  const chainSyncContract = new ethers.Contract(
    addresses.chainSync,
    CHAINSYNC_ABI,
    signer
  );

  // Use parseUnits with correct decimals (USDT/USDC = 6, most others = 18)
  const amountBigInt = ethers.parseUnits(amount, decimals);

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
 * @param tokenAddress - The ERC20 token contract address
 * @param recipientAddress - The recipient wallet address
 * @param amount - The amount to transfer (as a string, e.g., "2.5")
 * @param destinationChainId - The destination chain ID
 * @param decimals - Token decimals (default 18, use 6 for USDT/USDC)
 */
export async function executeCrossChainTransfer(
  tokenAddress: string,
  recipientAddress: string,
  amount: string,
  destinationChainId: number,
  decimals: number = 18
): Promise<string> {
  const addresses = getContractAddresses();

  const signer = await getSigner();
  if (!signer) throw new Error('No signer available');

  const chainSyncContract = new ethers.Contract(
    addresses.chainSync,
    CHAINSYNC_ABI,
    signer
  );

  // Use parseUnits with correct decimals (USDT/USDC = 6, most others = 18)
  const amountBigInt = ethers.parseUnits(amount, decimals);

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
 * Uses direct RPC connection for reliable read operations
 */
export async function getTokenBalance(
  tokenAddress: string,
  userAddress: string
): Promise<string> {
  // Use direct RPC provider for read-only operations
  const provider = getReadOnlyProvider();

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await tokenContract.balanceOf(userAddress);

  return ethers.formatEther(balance);
}

/**
 * Calculate transfer fee
 * Uses direct RPC connection for reliable read operations
 */
export async function calculateTransferFee(amount: string): Promise<string> {
  const addresses = getContractAddresses();

  // Use direct RPC provider for read-only operations
  const provider = getReadOnlyProvider();

  const chainSyncContract = new ethers.Contract(
    addresses.chainSync,
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
 * Uses direct RPC connection for reliable read operations
 * @param userAddress - The user's wallet address
 * @param chainId - Optional chain ID (defaults to Ethereum mainnet)
 */
export async function getUserStakedAmount(userAddress: string, chainId: number = 1): Promise<string> {
  const addresses = getContractAddresses(chainId);

  // Use direct RPC provider for read-only operations
  const provider = getReadOnlyProvider(chainId);

  const validatorRegistry = new ethers.Contract(
    addresses.validatorRegistry,
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
 * Uses direct RPC connection for reliable read operations
 * @param userAddress - The user's wallet address
 * @param chainId - Optional chain ID (defaults to Ethereum mainnet)
 */
export async function getUserValidatorInfo(userAddress: string, chainId: number = 1): Promise<{
  stake: string;
  isActive: boolean;
  rewards: string;
}> {
  const addresses = getContractAddresses(chainId);

  // Use direct RPC provider for read-only operations
  const provider = getReadOnlyProvider(chainId);

  const validatorRegistry = new ethers.Contract(
    addresses.validatorRegistry,
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

/**
 * Check if the asset symbol represents native ETH
 */
export function isNativeETH(symbol: string): boolean {
  return symbol === 'ETH';
}

/**
 * Get native ETH balance for a user
 * @param userAddress - The user's wallet address
 * @param chainId - Optional chain ID (defaults to current chain)
 */
export async function getNativeETHBalance(userAddress: string, chainId?: number): Promise<string> {
  const provider = getReadOnlyProvider(chainId);
  const balance = await provider.getBalance(userAddress);
  return ethers.formatEther(balance);
}

/**
 * Wrap native ETH to WETH
 * This deposits ETH into the WETH contract and receives WETH tokens
 * @param wethAddress - The WETH contract address for the current chain
 * @param amount - The amount of ETH to wrap (as a string, e.g., "1.5")
 * @returns The transaction hash
 */
export async function wrapETH(wethAddress: string, amount: string): Promise<string> {
  const signer = await getSigner();
  if (!signer) throw new Error('No signer available');

  const wethContract = new ethers.Contract(wethAddress, WETH_ABI, signer);
  const amountWei = ethers.parseEther(amount);

  // Call deposit() with the ETH value
  const tx = await wethContract.deposit({ value: amountWei });
  const receipt = await tx.wait();

  console.log(`Wrapped ${amount} ETH to WETH. TX: ${receipt.hash}`);
  return receipt.hash;
}

/**
 * Unwrap WETH back to native ETH
 * This withdraws WETH from the contract and receives native ETH
 * @param wethAddress - The WETH contract address for the current chain
 * @param amount - The amount of WETH to unwrap (as a string, e.g., "1.5")
 * @returns The transaction hash
 */
export async function unwrapWETH(wethAddress: string, amount: string): Promise<string> {
  const signer = await getSigner();
  if (!signer) throw new Error('No signer available');

  const wethContract = new ethers.Contract(wethAddress, WETH_ABI, signer);
  const amountWei = ethers.parseEther(amount);

  const tx = await wethContract.withdraw(amountWei);
  const receipt = await tx.wait();

  console.log(`Unwrapped ${amount} WETH to ETH. TX: ${receipt.hash}`);
  return receipt.hash;
}

/**
 * Send native ETH directly to a recipient (no wrapping needed)
 * This is used for same-chain ETH transfers - simpler and cheaper than wrapping
 * @param recipientAddress - The recipient wallet address
 * @param amount - The amount of ETH to send (as a string, e.g., "1.5")
 * @returns The transaction hash
 */
export async function sendNativeETH(recipientAddress: string, amount: string): Promise<string> {
  const signer = await getSigner();
  if (!signer) throw new Error('No signer available');

  const amountWei = ethers.parseEther(amount);

  const tx = await signer.sendTransaction({
    to: recipientAddress,
    value: amountWei,
  });

  const receipt = await tx.wait();
  if (!receipt) throw new Error('Transaction failed - no receipt');

  console.log(`Sent ${amount} ETH to ${recipientAddress}. TX: ${receipt.hash}`);
  return receipt.hash;
}
