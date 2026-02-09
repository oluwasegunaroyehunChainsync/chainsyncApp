import { Chain, Asset } from '@/types';

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  1: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpc: 'https://rpc.ankr.com/eth/51c635de48d8fa9c44e9a8684208b65913be871f023fdb57a9e4d8b983e0d8d1',
    explorer: 'https://etherscan.io',
    nativeToken: 'ETH',
    decimals: 18,
  },
  137: {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpc: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    nativeToken: 'MATIC',
    decimals: 18,
  },
  56: {
    id: 56,
    name: 'BNB Chain',
    symbol: 'BNB',
    rpc: 'https://bsc-dataseed.bnbchain.org',
    explorer: 'https://bscscan.com',
    nativeToken: 'BNB',
    decimals: 18,
  },
  250: {
    id: 250,
    name: 'Fantom',
    symbol: 'FTM',
    rpc: 'https://rpc.ftm.tools',
    explorer: 'https://ftmscan.com',
    nativeToken: 'FTM',
    decimals: 18,
  },
  42161: {
    id: 42161,
    name: 'Arbitrum',
    symbol: 'ARB',
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    nativeToken: 'ETH',
    decimals: 18,
  },
  43114: {
    id: 43114,
    name: 'Avalanche',
    symbol: 'AVAX',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
    nativeToken: 'AVAX',
    decimals: 18,
  },
  1088: {
    id: 1088,
    name: 'Metis',
    symbol: 'METIS',
    rpc: 'https://andromeda.metis.io',
    explorer: 'https://andromeda-explorer.metis.io',
    nativeToken: 'METIS',
    decimals: 18,
  },
  8453: {
    id: 8453,
    name: 'Base',
    symbol: 'BASE',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    nativeToken: 'ETH',
    decimals: 18,
  },
  7000: {
    id: 7000,
    name: 'ZetaChain',
    symbol: 'ZETA',
    rpc: 'https://zetachain-evm-mainnet.g.alchemy.com/v2/demo',
    explorer: 'https://explorer.zetachain.com',
    nativeToken: 'ZETA',
    decimals: 18,
  },
  11155111: {
    id: 11155111,
    name: 'Sepolia',
    symbol: 'SEP',
    rpc: 'https://sepolia.infura.io/v3/431555c0703a4385b753bf1b912fd846',
    explorer: 'https://sepolia.etherscan.io',
    nativeToken: 'ETH',
    decimals: 18,
  },
  421614: {
    id: 421614,
    name: 'Arbitrum Sepolia',
    symbol: 'ARB-SEP',
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorer: 'https://sepolia.arbiscan.io',
    nativeToken: 'ETH',
    decimals: 18,
  },
  31337: {
    id: 31337,
    name: 'Hardhat',
    symbol: 'HH',
    rpc: 'http://127.0.0.1:8545',
    explorer: '',
    nativeToken: 'ETH',
    decimals: 18,
  },
};

// Contract addresses per network
// IMPORTANT: Update these addresses after mainnet deployment!
export const CONTRACT_ADDRESSES: Record<number, {
  cstToken: string;
  chainSync: string;
  validatorRegistry: string;
}> = {
  // ============================================
  // MAINNET ADDRESSES (Update after deployment)
  // ============================================

  // Ethereum Mainnet (REDEPLOYED 2026-01-29 with SafeERC20 for USDT support)
  1: {
    cstToken: '0xD2eb148c2ccb54e88F21529Aec74dd7ce2232b06',
    chainSync: '0x236484C9a7A37D6fb9eae83E8FfB1b34CB70a73B',
    validatorRegistry: '0x592C950515DAC7502225F4a461774abE7df0dBFD',
  },
  // Polygon Mainnet
  137: {
    cstToken: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    chainSync: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    validatorRegistry: '0x0000000000000000000000000000000000000000', // TODO: Deploy
  },
  // Arbitrum One (Mainnet)
  42161: {
    cstToken: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    chainSync: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    validatorRegistry: '0x0000000000000000000000000000000000000000', // TODO: Deploy
  },
  // Base Mainnet (Redeployed 2026-01-30 with relayTransfer)
  8453: {
    cstToken: '0xc2B916B687D97f9D7F5aB66d3E9F3C09Bd65F55F',
    chainSync: '0x10ad8653eba86adB6da714f4bf17085D6CaD93f6',
    validatorRegistry: '0xD2eb148c2ccb54e88F21529Aec74dd7ce2232b06',
  },
  // BSC Mainnet (Deployed 2026-02-04)
  56: {
    cstToken: '0x674B6ac6c6505CAf4E7C5203CCF58370B5Fa2839',
    chainSync: '0xa03a4Ab91562c983327Df7Ed3A71A5DDB1F18b71',
    validatorRegistry: '0xa03a4Ab91562c983327Df7Ed3A71A5DDB1F18b71', // Same as chainSync on BSC
  },

  // ============================================
  // TESTNET ADDRESSES (Currently Deployed)
  // ============================================

  // Hardhat Local
  31337: {
    cstToken: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    chainSync: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
    validatorRegistry: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
  },
  // Sepolia Testnet (LIVE)
  11155111: {
    cstToken: '0xd62684427bc5a8b7eaDa01E3484f1Fa8d4bcDacD',
    chainSync: '0x67EB5641679A476CB408E201ed3CB087a2422352',
    validatorRegistry: '0xF2332CAeD0567DCF513359FD2788b3a63aC36175',
  },
  // Arbitrum Sepolia Testnet (LIVE)
  421614: {
    cstToken: '0xd62684427bc5a8b7eaDa01E3484f1Fa8d4bcDacD',
    chainSync: '0x67EB5641679A476CB408E201ed3CB087a2422352',
    validatorRegistry: '0xF2332CAeD0567DCF513359FD2788b3a63aC36175',
  },
};

// Supported tokens for transfers on ChainSync
// Native ETH transfer behavior:
//   - Same-chain: Direct ETH send (no wrapping) - simpler and cheaper
//   - Cross-chain: Auto-wrap to WETH then transfer via ChainSync bridge
export const SUPPORTED_ASSETS: Record<string, Asset> = {
  ETH: {
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000', // Native ETH (direct send for same-chain, wraps to WETH for cross-chain)
    balance: '0',
    usdPrice: 3200,
  },
  CST: {
    symbol: 'CST',
    name: 'ChainSync Token',
    decimals: 18,
    address: '0xD2eb148c2ccb54e88F21529Aec74dd7ce2232b06', // Ethereum Mainnet deployment
    balance: '0',
    usdPrice: 1.0,
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Ethereum Mainnet WETH
    balance: '0',
    usdPrice: 3200,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum Mainnet USDC
    balance: '0',
    usdPrice: 1.0,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum Mainnet USDT
    balance: '0',
    usdPrice: 1.0,
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // Ethereum Mainnet DAI
    balance: '0',
    usdPrice: 1.0,
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // Ethereum Mainnet WBTC
    balance: '0',
    usdPrice: 95000,
  },
  LINK: {
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // Ethereum Mainnet LINK
    balance: '0',
    usdPrice: 15,
  },
  UNI: {
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // Ethereum Mainnet UNI
    balance: '0',
    usdPrice: 8,
  },
  AAVE: {
    symbol: 'AAVE',
    name: 'Aave',
    decimals: 18,
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // Ethereum Mainnet AAVE
    balance: '0',
    usdPrice: 180,
  },
};

// Chain-specific token addresses - tokens have different addresses on each chain
// ETH entries point to WETH contract addresses (used for cross-chain auto-wrap only)
export const CHAIN_TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  // Ethereum Mainnet (1)
  1: {
    ETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH contract for auto-wrap
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  },
  // Base Mainnet (8453)
  8453: {
    ETH: '0x4200000000000000000000000000000000000006', // WETH contract for auto-wrap on Base
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Native USDC on Base
    WETH: '0x4200000000000000000000000000000000000006', // WETH on Base
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // DAI on Base
    USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // Bridged USDC (USDbC)
  },
  // BSC Mainnet (56) - Note: BSC uses BNB as native, ETH is wrapped
  56: {
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC on BSC
    USDT: '0x55d398326f99059fF775485246999027B3197955', // USDT on BSC
    DAI: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', // DAI on BSC
    WETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // ETH on BSC (Binance-peg)
    WBTC: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTCB on BSC
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
  },
  // Polygon (137)
  137: {
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Native USDC on Polygon
    'USDC.e': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Bridged USDC.e
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT on Polygon
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI on Polygon
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
    WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC on Polygon
  },
  // Arbitrum One (42161)
  42161: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Native USDC on Arbitrum
    'USDC.e': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // Bridged USDC.e
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT on Arbitrum
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI on Arbitrum
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH on Arbitrum
    WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // WBTC on Arbitrum
  },
  // Sepolia Testnet (11155111)
  11155111: {
    ETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH contract for auto-wrap on Sepolia
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia WETH
  },
  // Arbitrum Sepolia (421614)
  421614: {
    USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia USDC
  },
};

/**
 * Get the token address for a specific chain
 * Falls back to Ethereum mainnet address if chain-specific address not found
 */
export function getTokenAddressForChain(symbol: string, chainId: number): string {
  // First check chain-specific addresses
  const chainAddresses = CHAIN_TOKEN_ADDRESSES[chainId];
  if (chainAddresses && chainAddresses[symbol]) {
    return chainAddresses[symbol];
  }

  // For CST token, use the contract addresses
  if (symbol === 'CST') {
    return getCSTTokenAddress(chainId);
  }

  // Fallback to the default (Ethereum mainnet) address from SUPPORTED_ASSETS
  const asset = SUPPORTED_ASSETS[symbol];
  if (asset) {
    return asset.address;
  }

  throw new Error(`Token ${symbol} not supported`);
}

export const TRANSFER_FEES = {
  BASE_FEE_PERCENT: 0.1,
  PRIORITY_FEE_PERCENT: 0.05,
  FAST_FEE_PERCENT: 0.15,
};

export const STAKING_CONFIG = {
  MIN_STAKE: '0.1',
  UNSTAKE_DELAY_DAYS: 21,
  REWARD_FREQUENCY: 'daily',
};

export const GOVERNANCE_CONFIG = {
  MIN_VOTING_POWER: '1',
  PROPOSAL_DURATION_DAYS: 7,
  QUORUM_PERCENT: 40,
};

// Helper to ensure BASE_URL always has /api/v1 suffix
const getBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL || 'https://api.chainsync.org';
  // Remove trailing slash if present
  const cleanUrl = envUrl.replace(/\/$/, '');
  // If URL doesn't already include /api/v1, add it
  if (!cleanUrl.endsWith('/api/v1')) {
    return `${cleanUrl}/api/v1`;
  }
  return cleanUrl;
};

export const API_ENDPOINTS = {
  BASE_URL: getBaseUrl(),
  AUTH: '/auth',
  TRANSFERS: '/transfers',
  VALIDATORS: '/validators',
  GOVERNANCE: '/governance',
  HEALTH: '/health',
};

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 1024,
  DESKTOP: 1280,
};

/**
 * Get the CST token address for a specific chain
 */
export function getCSTTokenAddress(chainId: number): string {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (addresses) {
    return addresses.cstToken;
  }
  // Fallback to Ethereum Mainnet address
  return '0xD2eb148c2ccb54e88F21529Aec74dd7ce2232b06';
}
