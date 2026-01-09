export {};

declare global {
  interface Window {
    // EIP-1193 compatible provider (MetaMask, Trust Wallet, Coinbase Wallet, etc.)
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;

      // Wallet identification flags
      isMetaMask?: boolean;
      isTrust?: boolean;
      isCoinbaseWallet?: boolean;
      isPhantom?: boolean;

      // Multiple providers (EIP-6963)
      providers?: any[];
    };
  }
}
