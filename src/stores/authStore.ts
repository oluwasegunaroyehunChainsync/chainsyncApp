import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthToken } from '@/types';

interface AuthState {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
  enableTwoFactor: () => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          const mockUser: User = {
            id: `user_${Date.now()}`,
            email,
            firstName: 'John',
            lastName: 'Doe',
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockToken: AuthToken = {
            accessToken: `access_${Math.random().toString(36).slice(2)}`,
            refreshToken: `refresh_${Math.random().toString(36).slice(2)}`,
            tokenType: 'Bearer',
            expiresIn: 3600,
          };

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          const mockUser: User = {
            id: `user_${Date.now()}`,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockToken: AuthToken = {
            accessToken: `access_${Math.random().toString(36).slice(2)}`,
            refreshToken: `refresh_${Math.random().toString(36).slice(2)}`,
            tokenType: 'Bearer',
            expiresIn: 3600,
          };

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Signup failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
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
          await new Promise((resolve) => setTimeout(resolve, 300));
          set((state) => ({
            user: state.user ? { ...state.user, twoFactorEnabled: true } : null,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to enable 2FA', isLoading: false });
          throw error;
        }
      },

      disableTwoFactor: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          set((state) => ({
            user: state.user ? { ...state.user, twoFactorEnabled: false } : null,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to disable 2FA', isLoading: false });
          throw error;
        }
      },

      verifyTwoFactor: async (code: string) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (code.length !== 6) throw new Error('Invalid code format');
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Verification failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      refreshToken: async () => {
        const state = get();
        if (!state.token) return;

        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const newToken: AuthToken = {
            accessToken: `access_${Math.random().toString(36).slice(2)}`,
            refreshToken: `refresh_${Math.random().toString(36).slice(2)}`,
            tokenType: 'Bearer',
            expiresIn: 3600,
          };
          set({ token: newToken });
        } catch (error) {
          set({ error: 'Token refresh failed' });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
