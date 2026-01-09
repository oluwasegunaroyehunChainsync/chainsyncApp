import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthToken } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: AuthToken | null;
  walletAddress: string | null;
  chainId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Wallet authentication with backend
  authenticateWallet: (address: string, chainId: number, signature: string, message: string, nonce: string) => Promise<void>;

  // Get authentication challenge from backend
  getChallenge: (address: string, chainId: number) => Promise<{ message: string; nonce: string }>;

  // Refresh token
  refreshToken: () => Promise<void>;

  // Get current user info
  fetchCurrentUser: () => Promise<void>;

  // Set wallet connection
  setWalletConnection: (address: string, chainId: number) => void;

  // Logout
  logout: () => void;

  // Local state management (kept for backward compatibility)
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
  enableTwoFactor: () => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      walletAddress: null,
      chainId: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      getChallenge: async (address: string, chainId: number) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.getChallenge(address, chainId) as any;
          set({ isLoading: false });
          return {
            message: result.message,
            nonce: result.nonce,
          };
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to get challenge';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      authenticateWallet: async (address: string, chainId: number, signature: string, message: string, nonce: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.verifySignature(
            address,
            signature,
            message,
            nonce,
            chainId
          ) as any;

          const mockUser: User = {
            id: result.userId || `user_${Date.now()}`,
            email: `${address.slice(0, 6)}@wallet.local`,
            firstName: 'Wallet',
            lastName: 'User',
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const authToken: AuthToken = {
            accessToken: result.accessToken || result.token,
            refreshToken: result.refreshToken,
            tokenType: 'Bearer',
            expiresIn: result.expiresIn || 3600,
          };

          set({
            user: mockUser,
            token: authToken,
            walletAddress: address,
            chainId,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error?.message || 'Authentication failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      refreshToken: async () => {
        const state = get();
        if (!state.token?.refreshToken) {
          set({ error: 'No refresh token available' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const result = await apiClient.refreshToken(state.token.refreshToken) as any;

          const newToken: AuthToken = {
            accessToken: result.accessToken || result.token,
            refreshToken: result.refreshToken || state.token.refreshToken,
            tokenType: 'Bearer',
            expiresIn: result.expiresIn || 3600,
          };

          set({ token: newToken, isLoading: false });
        } catch (error: any) {
          const errorMessage = error?.message || 'Token refresh failed';
          set({ error: errorMessage, isLoading: false });
          // On refresh failure, logout user
          get().logout();
          throw error;
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiClient.getCurrentUser() as User;
          set({ user, isLoading: false });
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch user';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      setWalletConnection: (address: string, chainId: number) => {
        set({
          walletAddress: address,
          chainId,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          walletAddress: null,
          chainId: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (data: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data, updatedAt: new Date().toISOString() } : null,
        }));
      },

      clearError: () => {
        set({ error: null });
      },

      enableTwoFactor: async () => {
        set({ isLoading: true });
        try {
          // TODO: Implement backend call for 2FA
          await new Promise((resolve) => setTimeout(resolve, 300));
          set((state) => ({
            user: state.user ? { ...state.user, twoFactorEnabled: true } : null,
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: 'Failed to enable 2FA', isLoading: false });
          throw error;
        }
      },

      disableTwoFactor: async () => {
        set({ isLoading: true });
        try {
          // TODO: Implement backend call for 2FA
          await new Promise((resolve) => setTimeout(resolve, 300));
          set((state) => ({
            user: state.user ? { ...state.user, twoFactorEnabled: false } : null,
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: 'Failed to disable 2FA', isLoading: false });
          throw error;
        }
      },

      verifyTwoFactor: async (code: string) => {
        set({ isLoading: true });
        try {
          // TODO: Implement backend call for 2FA verification
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (code.length !== 6) throw new Error('Invalid code format');
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error?.message || 'Verification failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        walletAddress: state.walletAddress,
        chainId: state.chainId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
