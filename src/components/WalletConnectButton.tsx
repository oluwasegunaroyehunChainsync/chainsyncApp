/**
 * WalletConnectButton Component
 * Production-grade wallet connection button with MetaMask integration
 */

import React, { useState } from "react";
import { useWeb3Auth } from "../hooks/useWeb3Auth";

export interface WalletConnectButtonProps {
    apiUrl: string;
    onConnected?: (address: string, chainId: number) => void;
    onDisconnected?: () => void;
    onError?: (error: Error) => void;
    className?: string;
    connectedClassName?: string;
    loadingClassName?: string;
    errorClassName?: string;
}

/**
 * WalletConnectButton Component
 *
 * A production-ready React component for wallet connection.
 * Handles MetaMask integration, signature verification, and token management.
 *
 * @example
 * ```tsx
 * import { WalletConnectButton } from "./WalletConnectButton";
 *
 * export default function App() {
 *   return (
 *     <WalletConnectButton
 *       apiUrl="http://localhost:3001"
 *       onConnected={(address, chainId) => {
 *         console.log(`Connected: ${address} on chain ${chainId}`);
 *       }}
 *       className="px-4 py-2 bg-blue-500 text-white rounded"
 *     />
 *   );
 * }
 * ```
 */
export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
                                                                            apiUrl,
                                                                            onConnected,
                                                                            onDisconnected,
                                                                            onError,
                                                                            className = "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition",
                                                                            connectedClassName = "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition",
                                                                            loadingClassName = "px-4 py-2 bg-gray-500 text-white rounded cursor-not-allowed opacity-50",
                                                                            errorClassName = "px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition",
                                                                        }) => {
    const auth = useWeb3Auth({ apiUrl });
    const [showError, setShowError] = useState(false);

    const handleConnect = async () => {
        try {
            setShowError(false);
            await auth.connectWallet();

            if (auth.address && auth.chainId) {
                onConnected?.(auth.address, auth.chainId);
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            setShowError(true);
            onError?.(err);
        }
    };

    const handleDisconnect = () => {
        auth.disconnectWallet();
        onDisconnected?.();
    };

    // Connected state
    if (auth.isConnected && auth.address) {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={handleDisconnect}
                    className={connectedClassName}
                    title={`Connected: ${auth.address}`}
                >
                    <span className="inline-block w-2 h-2 bg-green-300 rounded-full mr-2"></span>
                    {truncateAddress(auth.address)}
                </button>

                {auth.expiresAt && (
                    <span className="text-xs text-gray-500">
            Expires in {auth.getTimeUntilExpiry()}s
          </span>
                )}
            </div>
        );
    }

    // Error state
    if (auth.error && showError) {
        return (
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleConnect}
                    disabled={auth.isLoading}
                    className={auth.isLoading ? loadingClassName : errorClassName}
                    title={auth.error}
                >
                    {auth.isLoading ? "Connecting..." : "Retry Connection"}
                </button>

                <p className="text-xs text-red-500">{auth.error}</p>
            </div>
        );
    }

    // Loading state
    if (auth.isLoading) {
        return (
            <button disabled className={loadingClassName}>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Connecting...
            </button>
        );
    }

    // Default state
    return (
        <button onClick={handleConnect} className={className}>
            {!auth.isMetaMaskInstalled() ? "Install MetaMask" : "Connect Wallet"}
        </button>
    );
};

/**
 * Truncate address for display
 */
function truncateAddress(address: string, chars: number = 4): string {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, chars + 2)}...${address.substring(
        address.length - chars
    )}`;
}

export default WalletConnectButton;
