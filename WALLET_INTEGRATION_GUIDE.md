# Multi-Wallet Integration Guide

ChainSync is designed to work with **any EIP-1193 compatible wallet**. The current implementation in `src/utils/web3.ts` is **already wallet-agnostic** and will work with:

## ✅ Already Supported (No Code Changes Needed)

### 1. **MetaMask**
- Browser extension or mobile app
- Uses `window.ethereum`
- **Already works out of the box**

### 2. **Trust Wallet**
- Mobile browser or browser extension
- Uses `window.ethereum`
- **Already works out of the box**

### 3. **Coinbase Wallet**
- Browser extension or mobile app
- Uses `window.ethereum`
- **Already works out of the box**

### 4. **Phantom** (Ethereum support)
- Browser extension
- Uses `window.ethereum` (when on Ethereum networks)
- **Already works out of the box**

### 5. **Brave Wallet**
- Built into Brave browser
- Uses `window.ethereum`
- **Already works out of the box**

---

## 🔧 Requires Additional Setup

### **WalletConnect**
WalletConnect is **not** an injected provider like the others. It requires a separate integration:

#### Installation:
```bash
npm install @walletconnect/web3-provider
# or
npm install @web3modal/ethers
```

#### Integration Steps:

1. **Create a WalletConnect provider wrapper** in `src/utils/walletconnect.ts`:

```typescript
import { EthereumProvider } from '@walletconnect/ethereum-provider';

export async function initializeWalletConnect() {
  const provider = await EthereumProvider.init({
    projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
    chains: [1], // Ethereum mainnet
    optionalChains: [137, 42161, 10, 11155111, 80002, 31337], // Polygon, Arbitrum, Optimism, Sepolia, Mumbai, Localhost
    showQrModal: true,
    methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData'],
    events: ['chainChanged', 'accountsChanged'],
  });

  await provider.enable();
  return provider;
}
```

2. **Update `src/utils/web3.ts`** to accept custom providers:

```typescript
let customProvider: any = null;

export function setCustomProvider(provider: any) {
  customProvider = provider;
}

export function getProvider(): ethers.BrowserProvider | null {
  if (customProvider) {
    return new ethers.BrowserProvider(customProvider);
  }

  if (typeof window === 'undefined') return null;
  if (!window.ethereum) return null;

  return new ethers.BrowserProvider(window.ethereum);
}
```

3. **Add WalletConnect button** in your wallet connection UI:

```typescript
import { initializeWalletConnect } from '@/utils/walletconnect';
import { setCustomProvider } from '@/utils/web3';

async function connectWalletConnect() {
  const provider = await initializeWalletConnect();
  setCustomProvider(provider);
  // Now all web3.ts functions will use WalletConnect
}
```

---

## 🎨 UI/UX Recommendations

### Wallet Selection Modal

Create a wallet selection modal where users can choose their preferred wallet:

```typescript
const SUPPORTED_WALLETS = [
  {
    name: 'MetaMask',
    icon: '/wallets/metamask.svg',
    type: 'injected',
    detectFunction: () => window.ethereum?.isMetaMask,
  },
  {
    name: 'Trust Wallet',
    icon: '/wallets/trust.svg',
    type: 'injected',
    detectFunction: () => window.ethereum?.isTrust,
  },
  {
    name: 'Coinbase Wallet',
    icon: '/wallets/coinbase.svg',
    type: 'injected',
    detectFunction: () => window.ethereum?.isCoinbaseWallet,
  },
  {
    name: 'Phantom',
    icon: '/wallets/phantom.svg',
    type: 'injected',
    detectFunction: () => window.ethereum?.isPhantom,
  },
  {
    name: 'WalletConnect',
    icon: '/wallets/walletconnect.svg',
    type: 'walletconnect',
    connectFunction: connectWalletConnect,
  },
];
```

---

## 🔑 How Token Approval Works Across Wallets

**Good news**: Token approval works **identically** across all wallets because they all:

1. Implement the **EIP-1193** standard
2. Use the same `eth_sendTransaction` method
3. Prompt the user with the same transaction details
4. Return the same transaction hash format

### Current Implementation (`src/utils/web3.ts:approveToken`)

```typescript
export async function approveToken(
  tokenAddress: string,
  amount: string,
  spenderAddress: string = CHAINSYNC_CONTRACT_ADDRESS
): Promise<string> {
  const signer = await getSigner(); // Works with ANY wallet
  if (!signer) throw new Error('No signer available');

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const amountBigInt = ethers.parseEther(amount);

  const tx = await tokenContract.approve(spenderAddress, amountBigInt);
  const receipt = await tx.wait();

  return receipt.hash;
}
```

**This function will work with:**
- ✅ MetaMask
- ✅ Trust Wallet
- ✅ Coinbase Wallet
- ✅ Phantom
- ✅ WalletConnect (after setup)
- ✅ Any future EIP-1193 wallet

---

## 📱 Mobile Wallet Support

### Trust Wallet Mobile
- Use **WalletConnect** for mobile browser integration
- Or use Trust Wallet's built-in browser (works like MetaMask mobile)

### Phantom Mobile
- Use **WalletConnect** for mobile browser integration
- Or use Phantom's built-in browser

### MetaMask Mobile
- Use MetaMask's built-in browser
- Or use **WalletConnect** for external app integration

---

## 🚀 Implementation Priority

### Phase 1: Already Done ✅
- MetaMask, Trust Wallet, Coinbase Wallet, Phantom (browser extensions)
- All work **without any code changes**

### Phase 2: WalletConnect Integration
1. Install WalletConnect SDK
2. Get project ID from WalletConnect Cloud
3. Add provider wrapper (as shown above)
4. Update `getProvider()` to accept custom providers
5. Add WalletConnect button to UI

### Phase 3: Enhanced UX
1. Create wallet selection modal
2. Add wallet detection logic
3. Show appropriate connection method for each wallet
4. Add wallet icons and branding

---

## 🔍 Testing Multi-Wallet Support

### Browser Extension Wallets (MetaMask, Trust, Coinbase, Phantom)
1. Install the wallet extension
2. Disable other wallet extensions (to avoid conflicts)
3. Reload the app
4. Click "Connect Wallet"
5. Test token approval and transfers

### WalletConnect
1. Implement WalletConnect as shown above
2. Scan QR code with mobile wallet
3. Approve connection
4. Test token approval and transfers

---

## ⚠️ Important Notes

### Multiple Wallets Installed
When multiple wallets are installed, they may conflict. Modern wallets use **EIP-6963** to avoid this:

```typescript
// Future enhancement: Support EIP-6963 for multi-wallet detection
if (window.ethereum?.providers) {
  // User has multiple wallets, let them choose
  const wallets = window.ethereum.providers;
  // Show selection modal
}
```

### Wallet Detection
Current implementation uses `window.ethereum`, which is the **last wallet to load**. For better UX, implement wallet selection modal.

---

## 📚 Additional Resources

- [EIP-1193: Ethereum Provider JavaScript API](https://eips.ethereum.org/EIPS/eip-1193)
- [EIP-6963: Multi Injected Provider Discovery](https://eips.ethereum.org/EIPS/eip-6963)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Trust Wallet Developer Docs](https://developer.trustwallet.com/)

---

## 🎯 Summary

**Current Status:**
- ✅ Token approval works with **all major wallets** (MetaMask, Trust, Coinbase, Phantom)
- ✅ No code changes needed for browser extension wallets
- ⚠️ WalletConnect requires additional setup (shown above)

**Your web3.ts is already wallet-agnostic!** 🎉
