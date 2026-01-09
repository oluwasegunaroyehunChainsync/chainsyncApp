import { Chain, Asset } from '@/types';

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  1: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpc: 'https://eth.rpc.blxrbdn.com',
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
    rpc: 'https://sepolia.infura.io/v3/YOUR_KEY',
    explorer: 'https://sepolia.etherscan.io',
    nativeToken: 'ETH',
    decimals: 18,
  },
};

export const SUPPORTED_ASSETS: Record<string, Asset> = {
  CST: {
    symbol: 'CST',
    name: 'ChainSync Token',
    decimals: 18,
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Local Hardhat deployment
    balance: '1000',
    usdPrice: 1.0,
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
    balance: '2.5',
    usdPrice: 2450,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    balance: '5000',
    usdPrice: 1.0,
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    balance: '3000',
    usdPrice: 1.0,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    balance: '2000',
    usdPrice: 1.0,
  },
};

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

export const API_ENDPOINTS = {
  BASE_URL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api/v1',
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
