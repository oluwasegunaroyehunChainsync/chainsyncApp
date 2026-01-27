export type ChainId = 1 | 137 | 56 | 250 | 42161 | 43114 | 1088 | 8453 | 7000 | 11155111 | 421614 | 31337;

export type TransferStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ProposalStatus = 'active' | 'passed' | 'failed' | 'executed';
export type VoteChoice = 'for' | 'against' | 'abstain';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface Chain {
  id: ChainId;
  name: string;
  symbol: string;
  rpc: string;
  explorer: string;
  nativeToken: string;
  decimals: number;
}

export interface Wallet {
  address: string;
  balance: string;
  chainId: ChainId;
  isConnected: boolean;
}

export interface Asset {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  balance: string;
  usdPrice: number;
}

export interface Transfer {
  id: string;
  sourceChain: ChainId;
  destinationChain: ChainId;
  amount: string;
  asset: string;
  fee: string;
  estimatedTime: number;
  status: TransferStatus;
  sourceHash?: string;
  destinationHash?: string;
  timestamp: number;
  createdAt: string;
  updatedAt: string;
}

export interface Validator {
  id: string;
  name: string;
  address: string;
  commission: string;
  apy: string;
  stakedAmount: string;
  delegators: number;
  uptime: string;
  totalRewards: string;
  description?: string;
  website?: string;
}

export interface StakingPosition {
  id: string;
  validatorId: string;
  validatorName: string;
  amount: string;
  rewards: string;
  apy: string;
  claimableRewards: string;
  createdAt: string;
  lastRewardClaim?: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: ProposalStatus;
  votesFor: string;
  votesAgainst: string;
  votesAbstain: string;
  totalVotes: string;
  startDate: string;
  endDate: string;
  proposer: string;
  details?: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  choice: VoteChoice;
  amount: string;
  voter: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  timestamp: number;
}

export interface DashboardStats {
  totalTransfers: number;
  totalVolume: string;
  activeChains: number;
  totalRewards: string;
  stakingValue: string;
  votingPower: string;
}

export interface TransactionHistory {
  id: string;
  type: 'transfer' | 'stake' | 'unstake' | 'claim' | 'vote';
  description: string;
  amount?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  hash?: string;
}
