/**
 * useWeb3Auth Hook
 * Production-grade Web3 authentication hook for React
 * Handles wallet connection, signature verification, and token management
 * Supports EIP-6963 multi-wallet discovery
 */

import { useState, useCallback, useEffect } from "react";
import { BrowserProvider } from "ethers";
import type { EIP1193Provider } from "./useWalletDiscovery";
import { setSelectedWalletProvider } from "@/utils/web3";

/**
 * Authentication state and configuration
 */
export interface Web3AuthState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  address: string | null;
  chainId: number | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

/**
 * Hook configuration options
 */
export interface Web3AuthConfig {
  apiUrl: string;
  storageKey?: string;
  autoRefresh?: boolean;
  refreshThreshold?: number; // milliseconds before expiry to auto-refresh
}

/**
 * Challenge response from backend
 */
interface ChallengeResponse {
  success: boolean;
  data: {
    message: string;
    nonce: string;
    expiresIn: number;
  };
}

/**
 * Authentication response from backend
 */
interface AuthResponse {
  success: boolean;
  data: {
    address: string;
    token: string;
    refreshToken: string;
    expiresIn: number;
    connectedAt: string;
  };
}

/**
 * Main Web3 Authentication Hook
 */
export const useWeb3Auth = (config: Web3AuthConfig) => {
  const {
    apiUrl,
    storageKey = "chainsync_auth",
    autoRefresh = true,
    refreshThreshold = 5 * 60 * 1000, // 5 minutes
  } = config;

  const [state, setState] = useState<Web3AuthState>({
    isConnected: false,
    isLoading: false,
    error: null,
    address: null,
    chainId: null,
    token: null,
    refreshToken: null,
    expiresAt: null,
  });

  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [currentEthProvider, setCurrentEthProvider] = useState<EIP1193Provider | null>(null);

  /**
   * Load stored authentication state from localStorage
   */
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState((prev) => ({
          ...prev,
          ...parsed,
          isConnected: !!parsed.token,
        }));
      } catch (error) {
        console.error("Failed to parse stored auth state:", error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  /**
   * Initialize provider
   */
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const newProvider = new BrowserProvider(window.ethereum);
      setProvider(newProvider);
    }
  }, []);

  /**
   * Auto-refresh token before expiry
   */
  useEffect(() => {
    if (!autoRefresh || !state.refreshToken || !state.expiresAt) {
      return;
    }

    const timeUntilExpiry = state.expiresAt - Date.now();
    if (timeUntilExpiry < refreshThreshold) {
      refreshToken();
      return;
    }

    const timer = setTimeout(() => {
      refreshToken();
    }, timeUntilExpiry - refreshThreshold);

    return () => clearTimeout(timer);
  }, [state.refreshToken, state.expiresAt, autoRefresh, refreshThreshold]);

  /**
   * Check if MetaMask is installed
   */
  const isMetaMaskInstalled = useCallback((): boolean => {
    return typeof window !== "undefined" && !!window.ethereum;
  }, []);

  /**
   * Get current connected address from MetaMask
   */
  const getConnectedAddress = useCallback(async (): Promise<string | null> => {
    if (!provider) return null;

    try {
      const signer = await provider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      console.error("Failed to get connected address:", error);
      return null;
    }
  }, [provider]);

  /**
   * Get current chain ID from MetaMask
   */
  const getChainId = useCallback(async (): Promise<number | null> => {
    if (!provider) return null;

    try {
      const network = await provider.getNetwork();
      return Number(network.chainId);
    } catch (error) {
      console.error("Failed to get chain ID:", error);
      return null;
    }
  }, [provider]);

  /**
   * Request challenge from backend
   */
  const requestChallenge = useCallback(
    async (address: string, chainId: number): Promise<{ message: string; nonce: string } | null> => {
      try {
        const response = await fetch(`${apiUrl}/api/v1/auth/challenge`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address, chainId }),
        });

        if (!response.ok) {
          throw new Error(`Challenge request failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle both response formats:
        // 1. Direct format: { message, nonce, expiresIn }
        // 2. Wrapped format: { success: true, data: { message, nonce, expiresIn } }
        if (data.message && data.nonce) {
          // Direct format (current backend)
          return { message: data.message, nonce: data.nonce };
        } else if (data.success && data.data?.message && data.data?.nonce) {
          // Wrapped format
          return { message: data.data.message, nonce: data.data.nonce };
        } else {
          throw new Error("Invalid challenge response format");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to request challenge";
        console.error(message, error);
        throw error;
      }
    },
    [apiUrl]
  );

  /**
   * Sign message with MetaMask
   */
  const signMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      try {
        const signer = await provider.getSigner();
        const signature = await signer.signMessage(message);
        return signature;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to sign message";
        console.error(message, error);
        throw error;
      }
    },
    [provider]
  );

  /**
   * Verify signature and authenticate
   */
  const verifySignature = useCallback(
    async (
      address: string,
      signature: string,
      message: string,
      nonce: string,
      chainId: number
    ): Promise<void> => {
      try {
        const response = await fetch(`${apiUrl}/api/v1/auth/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            signature,
            message,
            nonce,
            chainId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.message || error.error || `Authentication failed: ${response.statusText}`
          );
        }

        const data = await response.json();

        // Handle both response formats:
        // 1. Direct format: { token, refreshToken, expiresIn, address }
        // 2. Wrapped format: { success: true, data: { token, refreshToken, expiresIn, address } }
        let authData;
        if (data.token) {
          // Direct format (current backend)
          authData = data;
        } else if (data.success && data.data) {
          // Wrapped format
          authData = data.data;
        } else {
          throw new Error("Invalid authentication response format");
        }

        const expiresAt = Date.now() + authData.expiresIn * 1000;

        const newState: Web3AuthState = {
          isConnected: true,
          isLoading: false,
          error: null,
          address: authData.address || address,
          chainId,
          token: authData.token,
          refreshToken: authData.refreshToken,
          expiresAt,
        };

        setState(newState);
        localStorage.setItem(storageKey, JSON.stringify(newState));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Verification failed";
        setState((prev) => ({
          ...prev,
          error: message,
          isLoading: false,
        }));
        throw error;
      }
    },
    [apiUrl, storageKey]
  );

  /**
   * Main connect wallet function
   * @param walletProvider - Optional specific wallet provider (from EIP-6963 discovery)
   */
  const connectWallet = useCallback(async (walletProvider?: EIP1193Provider): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use provided wallet provider or fall back to window.ethereum
      const ethProvider = walletProvider || (window.ethereum as EIP1193Provider);

      if (!ethProvider) {
        throw new Error(
          "No wallet detected. Please install a Web3 wallet to continue."
        );
      }

      // Store the current provider for future use
      setCurrentEthProvider(ethProvider);

      // Also set it in web3.ts so transaction signing uses the correct wallet
      setSelectedWalletProvider(ethProvider);

      // Create ethers provider from the selected wallet
      const browserProvider = new BrowserProvider(ethProvider);
      setProvider(browserProvider);

      // Request wallet connection (this triggers the wallet popup)
      console.log('Requesting wallet connection...');
      await ethProvider.request({ method: 'eth_requestAccounts' });
      console.log('Wallet connection approved');

      // Get connected address
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();
      if (!address) {
        throw new Error("Failed to get wallet address");
      }

      // Get chain ID
      const network = await browserProvider.getNetwork();
      const chainId = Number(network.chainId);
      if (!chainId) {
        throw new Error("Failed to get chain ID");
      }

      // Request challenge
      const challenge = await requestChallenge(address, chainId);
      if (!challenge) {
        throw new Error("Failed to get challenge");
      }

      // Sign message
      const signature = await signer.signMessage(challenge.message);
      if (!signature) {
        throw new Error("Failed to sign message");
      }

      // Verify signature and authenticate
      await verifySignature(address, signature, challenge.message, challenge.nonce, chainId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Connection failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, [
    requestChallenge,
    verifySignature,
  ]);

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    if (!state.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: state.refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data: AuthResponse = await response.json();
      if (!data.success) {
        throw new Error("Token refresh failed");
      }

      const expiresAt = Date.now() + data.data.expiresIn * 1000;

      const newState: Web3AuthState = {
        ...state,
        token: data.data.token,
        refreshToken: data.data.refreshToken,
        expiresAt,
        error: null,
      };

      setState(newState);
      localStorage.setItem(storageKey, JSON.stringify(newState));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Token refresh failed";
      setState((prev) => ({
        ...prev,
        error: message,
      }));
      throw error;
    }
  }, [state, apiUrl, storageKey]);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback((): void => {
    setState({
      isConnected: false,
      isLoading: false,
      error: null,
      address: null,
      chainId: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
    });
    localStorage.removeItem(storageKey);

    // Clear the selected wallet provider
    setSelectedWalletProvider(null);
    setCurrentEthProvider(null);
  }, [storageKey]);

  /**
   * Get authorization header for API requests
   */
  const getAuthHeader = useCallback((): Record<string, string> => {
    if (!state.token) {
      return {};
    }

    return {
      Authorization: `Bearer ${state.token}`,
    };
  }, [state.token]);

  /**
   * Check if token is expired
   */
  const isTokenExpired = useCallback((): boolean => {
    if (!state.expiresAt) return true;
    return Date.now() > state.expiresAt;
  }, [state.expiresAt]);

  /**
   * Get time until token expiry in seconds
   */
  const getTimeUntilExpiry = useCallback((): number => {
    if (!state.expiresAt) return 0;
    return Math.max(0, Math.floor((state.expiresAt - Date.now()) / 1000));
  }, [state.expiresAt]);

  return {
    // State
    ...state,
    currentEthProvider,

    // Methods
    connectWallet,
    disconnectWallet,
    refreshToken,
    getAuthHeader,
    isTokenExpired,
    getTimeUntilExpiry,
    isMetaMaskInstalled,
    getConnectedAddress,
    getChainId,
  };
};

export default useWeb3Auth;
