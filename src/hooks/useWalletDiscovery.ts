/**
 * EIP-6963 Multi-Wallet Discovery Hook
 * Detects all installed Web3 wallets in the browser
 *
 * EIP-6963 is the standard for multi-wallet discovery that allows
 * dApps to detect and interact with multiple wallet providers
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * EIP-6963 Provider Info
 */
export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string; // Reverse DNS identifier
}

/**
 * EIP-6963 Provider Detail
 */
export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

/**
 * EIP-1193 Provider Interface
 */
export interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isTrust?: boolean;
  isCoinbaseWallet?: boolean;
  isPhantom?: boolean;
  isBraveWallet?: boolean;
  isRabby?: boolean;
}

/**
 * EIP-6963 Announce Provider Event
 */
interface EIP6963AnnounceProviderEvent extends Event {
  detail: EIP6963ProviderDetail;
}

/**
 * Detected wallet with provider
 */
export interface DetectedWallet {
  id: string;
  name: string;
  icon: string;
  rdns: string;
  provider: EIP1193Provider;
}

/**
 * Fallback wallet icons (data URIs)
 */
const WALLET_ICONS: Record<string, string> = {
  metamask: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMTIiIGhlaWdodD0iMTg5IiB2aWV3Qm94PSIwIDAgMjEyIDE4OSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cG9seWdvbiBmaWxsPSIjQ0RCREIyIiBwb2ludHM9IjYwLjc1IDE3My4yNSA4OC4zMTMgMTgwLjU2MyA4OC4zMTMgMTcxIDkwLjU2MyAxNjguNzUgMTA2LjMxMyAxNjguNzUgMTA2LjMxMyAxODAgMTA2LjMxMyAxODcuODc1IDg5LjQzOCAxODcuODc1IDY4LjYyNSAxNzguODc1Ii8+PC9nPjwvc3ZnPg==',
  trust: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjMzM3NUJCIi8+PC9zdmc+',
  coinbase: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjMDA1MkZGIi8+PC9zdmc+',
  phantom: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjQUI5RkY1Ii8+PC9zdmc+',
  rabby: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjOEM4M0ZGIi8+PC9zdmc+',
  brave: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjRkY1NTAwIi8+PC9zdmc+',
  default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjNjY2Ii8+PC9zdmc+',
};

/**
 * Hook for discovering installed Web3 wallets via EIP-6963
 */
export function useWalletDiscovery() {
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(true);

  /**
   * Handle wallet announcement from EIP-6963
   */
  const handleAnnouncement = useCallback((event: EIP6963AnnounceProviderEvent) => {
    const { info, provider } = event.detail;

    setWallets((prev) => {
      // Check if wallet already exists
      const exists = prev.some((w) => w.id === info.uuid);
      if (exists) return prev;

      const newWallet: DetectedWallet = {
        id: info.uuid,
        name: info.name,
        icon: info.icon || WALLET_ICONS.default,
        rdns: info.rdns,
        provider,
      };

      return [...prev, newWallet];
    });
  }, []);

  /**
   * Detect legacy wallets (window.ethereum)
   */
  const detectLegacyWallets = useCallback(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const ethereum = window.ethereum as EIP1193Provider;
    const legacyWallets: DetectedWallet[] = [];

    // Check for specific wallet flags
    if (ethereum.isMetaMask) {
      legacyWallets.push({
        id: 'legacy-metamask',
        name: 'MetaMask',
        icon: WALLET_ICONS.metamask,
        rdns: 'io.metamask',
        provider: ethereum,
      });
    } else if (ethereum.isTrust) {
      legacyWallets.push({
        id: 'legacy-trust',
        name: 'Trust Wallet',
        icon: WALLET_ICONS.trust,
        rdns: 'com.trustwallet.app',
        provider: ethereum,
      });
    } else if (ethereum.isCoinbaseWallet) {
      legacyWallets.push({
        id: 'legacy-coinbase',
        name: 'Coinbase Wallet',
        icon: WALLET_ICONS.coinbase,
        rdns: 'com.coinbase.wallet',
        provider: ethereum,
      });
    } else if (ethereum.isPhantom) {
      legacyWallets.push({
        id: 'legacy-phantom',
        name: 'Phantom',
        icon: WALLET_ICONS.phantom,
        rdns: 'app.phantom',
        provider: ethereum,
      });
    } else if (ethereum.isBraveWallet) {
      legacyWallets.push({
        id: 'legacy-brave',
        name: 'Brave Wallet',
        icon: WALLET_ICONS.brave,
        rdns: 'com.brave.wallet',
        provider: ethereum,
      });
    } else if (ethereum.isRabby) {
      legacyWallets.push({
        id: 'legacy-rabby',
        name: 'Rabby',
        icon: WALLET_ICONS.rabby,
        rdns: 'io.rabby',
        provider: ethereum,
      });
    } else {
      // Generic wallet fallback
      legacyWallets.push({
        id: 'legacy-unknown',
        name: 'Browser Wallet',
        icon: WALLET_ICONS.default,
        rdns: 'unknown',
        provider: ethereum,
      });
    }

    // Also check for multiple providers (some wallets expose this)
    const providers = (window.ethereum as any)?.providers;
    if (Array.isArray(providers)) {
      providers.forEach((provider: EIP1193Provider, index: number) => {
        if (provider.isMetaMask && !legacyWallets.some(w => w.rdns === 'io.metamask')) {
          legacyWallets.push({
            id: `provider-metamask-${index}`,
            name: 'MetaMask',
            icon: WALLET_ICONS.metamask,
            rdns: 'io.metamask',
            provider,
          });
        }
        if (provider.isTrust && !legacyWallets.some(w => w.rdns === 'com.trustwallet.app')) {
          legacyWallets.push({
            id: `provider-trust-${index}`,
            name: 'Trust Wallet',
            icon: WALLET_ICONS.trust,
            rdns: 'com.trustwallet.app',
            provider,
          });
        }
        if (provider.isCoinbaseWallet && !legacyWallets.some(w => w.rdns === 'com.coinbase.wallet')) {
          legacyWallets.push({
            id: `provider-coinbase-${index}`,
            name: 'Coinbase Wallet',
            icon: WALLET_ICONS.coinbase,
            rdns: 'com.coinbase.wallet',
            provider,
          });
        }
      });
    }

    setWallets((prev) => {
      // Merge legacy wallets with EIP-6963 wallets, avoiding duplicates
      const merged = [...prev];
      legacyWallets.forEach((legacy) => {
        const exists = merged.some(
          (w) => w.rdns === legacy.rdns || w.name === legacy.name
        );
        if (!exists) {
          merged.push(legacy);
        }
      });
      return merged;
    });
  }, []);

  /**
   * Request wallet announcements via EIP-6963
   */
  const requestWallets = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Dispatch request for wallet announcements
    window.dispatchEvent(new Event('eip6963:requestProvider'));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen for EIP-6963 wallet announcements
    const handleEvent = (event: Event) => {
      handleAnnouncement(event as EIP6963AnnounceProviderEvent);
    };

    window.addEventListener('eip6963:announceProvider', handleEvent);

    // Request wallet announcements
    requestWallets();

    // Also detect legacy wallets after a short delay
    const legacyTimer = setTimeout(() => {
      detectLegacyWallets();
      setIsDiscovering(false);
    }, 500);

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleEvent);
      clearTimeout(legacyTimer);
    };
  }, [handleAnnouncement, requestWallets, detectLegacyWallets]);

  /**
   * Get a specific wallet by ID
   */
  const getWallet = useCallback(
    (id: string): DetectedWallet | undefined => {
      return wallets.find((w) => w.id === id);
    },
    [wallets]
  );

  /**
   * Get the default/primary wallet
   */
  const getDefaultWallet = useCallback((): DetectedWallet | undefined => {
    // Prefer MetaMask, then others
    return (
      wallets.find((w) => w.rdns === 'io.metamask') ||
      wallets.find((w) => w.rdns === 'com.coinbase.wallet') ||
      wallets[0]
    );
  }, [wallets]);

  return {
    wallets,
    isDiscovering,
    getWallet,
    getDefaultWallet,
    hasWallets: wallets.length > 0,
  };
}

export default useWalletDiscovery;
