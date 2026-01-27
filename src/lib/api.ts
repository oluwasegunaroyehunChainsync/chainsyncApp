import { API_ENDPOINTS } from '@/constants';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_ENDPOINTS.BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Get token from localStorage if available
    // First try the Web3Auth storage (used by WalletConnectButton)
    const web3AuthStorage = localStorage.getItem('chainsync_auth');
    if (web3AuthStorage) {
      try {
        const authData = JSON.parse(web3AuthStorage);
        if (authData?.token) {
          headers['Authorization'] = `Bearer ${authData.token}`;
        }
      } catch (e) {
        console.error('Error parsing web3 auth storage:', e);
      }
    } else {
      // Fallback to old auth storage
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state?.token?.accessToken) {
            headers['Authorization'] = `Bearer ${state.token.accessToken}`;
          }
        } catch (e) {
          console.error('Error parsing auth storage:', e);
        }
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health endpoints
  async checkHealth() {
    return this.request('/health');
  }

  async checkHealthStatus() {
    return this.request('/health/status');
  }

  // Auth endpoints
  async getChallenge(address: string, chainId: number) {
    return this.request(`${API_ENDPOINTS.AUTH}/challenge`, {
      method: 'POST',
      body: JSON.stringify({ address, chainId }),
    });
  }

  async verifySignature(address: string, signature: string, message: string, nonce: string, chainId: number) {
    return this.request(`${API_ENDPOINTS.AUTH}/verify`, {
      method: 'POST',
      body: JSON.stringify({ address, signature, message, nonce, chainId }),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request(`${API_ENDPOINTS.AUTH}/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getCurrentUser() {
    return this.request(`${API_ENDPOINTS.AUTH}/me`);
  }

  // Transfer endpoints
  async getTransferQuote(params: {
    sourceChainId: number;
    destinationChainId: number;
    contractAddress: string;
    amount: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request(`${API_ENDPOINTS.TRANSFERS}/quote?${queryParams}`);
  }

  async initiateSameChainTransfer(data: {
    sourceChainId: number;
    tokenAddress: string;
    amount: string;
    recipient: string;
    contractAddress: string;
  }) {
    // Map frontend params to backend expected format
    const payload = {
      tokenAddress: data.tokenAddress,
      recipientAddress: data.recipient,
      amount: data.amount,
      sourceChainId: data.sourceChainId,
      contractAddress: data.contractAddress,
    };

    return this.request(`${API_ENDPOINTS.TRANSFERS}/same-chain`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async initiateCrossChainTransfer(data: {
    sourceChainId: number;
    destinationChainId: number;
    tokenAddress: string;
    amount: string;
    recipient: string;
    contractAddress: string;
  }) {
    // Map frontend params to backend expected format
    const payload = {
      tokenAddress: data.tokenAddress,
      recipientAddress: data.recipient,
      destinationChainId: data.destinationChainId,
      amount: data.amount,
      sourceChainId: data.sourceChainId,
      contractAddress: data.contractAddress,
    };

    return this.request(`${API_ENDPOINTS.TRANSFERS}/cross-chain`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getTransfer(transferId: string) {
    return this.request(`${API_ENDPOINTS.TRANSFERS}/${transferId}`);
  }

  async getTransfers() {
    return this.request(API_ENDPOINTS.TRANSFERS);
  }

  async updateTransferStatus(transferId: string, status: string, txHash: string) {
    return this.request(`${API_ENDPOINTS.TRANSFERS}/${transferId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, txHash }),
    });
  }

  // Validator endpoints
  async getValidators() {
    return this.request(`${API_ENDPOINTS.VALIDATORS}/list`);
  }

  async getActiveValidatorCount() {
    return this.request(`${API_ENDPOINTS.VALIDATORS}/active-count`);
  }

  async getValidatorInfo(address: string) {
    return this.request(`${API_ENDPOINTS.VALIDATORS}/info/${address}`);
  }

  async isValidatorActive(address: string) {
    return this.request(`${API_ENDPOINTS.VALIDATORS}/is-active/${address}`);
  }

  async getValidatorStake(address: string) {
    return this.request(`${API_ENDPOINTS.VALIDATORS}/stake/${address}`);
  }

  async registerValidator(data: { validatorAddress: string; stakeAmount: string }) {
    return this.request(`${API_ENDPOINTS.VALIDATORS}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async stakeValidator(data: { validatorAddress: string; amount: string }) {
    return this.request(`${API_ENDPOINTS.VALIDATORS}/stake`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Governance endpoints
  async getProposals() {
    return this.request(`${API_ENDPOINTS.GOVERNANCE}/proposals`);
  }

  async getProposal(proposalId: string) {
    return this.request(`${API_ENDPOINTS.GOVERNANCE}/proposals/${proposalId}`);
  }

  async getVotes() {
    return this.request(`${API_ENDPOINTS.GOVERNANCE}/votes`);
  }

  async getVotingPower(address: string) {
    return this.request(`${API_ENDPOINTS.GOVERNANCE}/voting-power/${address}`);
  }

  async createProposal(data: { title: string; description: string; type: string }) {
    return this.request(`${API_ENDPOINTS.GOVERNANCE}/proposals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async vote(data: { proposalId: string; support: boolean }) {
    return this.request(`${API_ENDPOINTS.GOVERNANCE}/vote`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
