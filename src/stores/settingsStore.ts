import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  // Display
  currency: 'USD' | 'EUR' | 'GBP' | 'ETH' | 'BTC';
  theme: 'light' | 'dark';

  // Transfer Defaults
  slippageTolerance: string;
  gasSpeed: 'slow' | 'standard' | 'fast';
  autoFillRecipient: boolean;
  defaultRecipient: string;

  // Notifications
  browserNotifications: boolean;
  emailNotifications: boolean;
  notifyOnComplete: boolean;
  notifyOnFailed: boolean;

  // Network
  defaultChain: number;
  customRpcEnabled: boolean;
  customRpcUrl: string;

  // Security
  sessionTimeout: number;
  confirmationThreshold: string;
  requireConfirmation: boolean;

  // Actions
  updateSetting: <K extends keyof Omit<SettingsState, 'updateSetting' | 'resetSettings' | 'applyTheme'>>(
    key: K,
    value: SettingsState[K]
  ) => void;
  resetSettings: () => void;
  applyTheme: () => void;
}

// Currency symbols and conversion rates (approximate)
export const CURRENCY_CONFIG: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  ETH: { symbol: 'Ξ', rate: 0.00031 }, // ~1 ETH = $3200
  BTC: { symbol: '₿', rate: 0.0000105 }, // ~1 BTC = $95000
};

const defaultSettings = {
  // Display
  currency: 'USD' as const,
  theme: 'light' as const,

  // Transfer Defaults
  slippageTolerance: '0.5',
  gasSpeed: 'standard' as const,
  autoFillRecipient: false,
  defaultRecipient: '',

  // Notifications
  browserNotifications: true,
  emailNotifications: false,
  notifyOnComplete: true,
  notifyOnFailed: true,

  // Network
  defaultChain: 1,
  customRpcEnabled: false,
  customRpcUrl: '',

  // Security
  sessionTimeout: 30,
  confirmationThreshold: '1000',
  requireConfirmation: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      updateSetting: (key, value) => {
        set({ [key]: value });
        // Auto-apply theme when changed
        if (key === 'theme') {
          setTimeout(() => get().applyTheme(), 0);
        }
      },

      resetSettings: () => {
        set(defaultSettings);
        get().applyTheme();
      },

      applyTheme: () => {
        const { theme } = get();
        const root = document.documentElement;

        if (theme === 'dark') {
          root.classList.add('dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.style.colorScheme = 'light';
        }
      },
    }),
    {
      name: 'chainsync-settings',
      onRehydrateStorage: () => (state) => {
        // Apply theme on app load
        if (state) {
          state.applyTheme();
        }
      },
    }
  )
);

// Helper function to format currency based on settings
export function formatCurrency(usdAmount: number, currency: string): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  const converted = usdAmount * config.rate;

  if (currency === 'ETH' || currency === 'BTC') {
    return `${config.symbol}${converted.toFixed(6)}`;
  }

  return `${config.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
