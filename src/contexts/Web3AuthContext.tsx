/**
 * Web3AuthContext
 * React Context for managing Web3 authentication state globally
 */

import React, { createContext, useContext, ReactNode } from "react";
import { useWeb3Auth, Web3AuthState, Web3AuthConfig } from "../hooks/useWeb3Auth";

/**
 * Context value type
 * Using ReturnType to get exact type from the hook
 */
type Web3AuthContextType = ReturnType<typeof useWeb3Auth>;

/**
 * Create Web3Auth context
 */
const Web3AuthContext = createContext<Web3AuthContextType | undefined>(
    undefined
);

/**
 * Web3AuthProvider Props
 */
interface Web3AuthProviderProps {
    config: Web3AuthConfig;
    children: ReactNode;
}

/**
 * Web3AuthProvider Component
 *
 * Provides Web3 authentication context to the entire application.
 *
 * @example
 * ```tsx
 * import { Web3AuthProvider } from "./Web3AuthContext";
 *
 * export default function App() {
 *   return (
 *     <Web3AuthProvider config={{ apiUrl: "http://localhost:3001" }}>
 *       <YourApp />
 *     </Web3AuthProvider>
 *   );
 * }
 * ```
 */
export const Web3AuthProvider: React.FC<Web3AuthProviderProps> = ({
                                                                      config,
                                                                      children,
                                                                  }) => {
    const auth = useWeb3Auth(config);

    return (
        <Web3AuthContext.Provider value={auth}>
            {children}
        </Web3AuthContext.Provider>
    );
};

/**
 * useWeb3AuthContext Hook
 *
 * Access Web3 authentication state and methods from any component.
 *
 * @throws {Error} If used outside of Web3AuthProvider
 *
 * @example
 * ```tsx
 * import { useWeb3AuthContext } from "./Web3AuthContext";
 *
 * export default function MyComponent() {
 *   const { address, isConnected, connectWallet } = useWeb3AuthContext();
 *
 *   return (
 *     <div>
 *       {isConnected ? (
 *         <p>Connected: {address}</p>
 *       ) : (
 *         <button onClick={connectWallet}>Connect</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export const useWeb3AuthContext = (): Web3AuthContextType => {
    const context = useContext(Web3AuthContext);

    if (context === undefined) {
        throw new Error(
            "useWeb3AuthContext must be used within a Web3AuthProvider"
        );
    }

    return context;
};

export default Web3AuthContext;
