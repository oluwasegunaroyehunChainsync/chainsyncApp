/**
 * App Component
 * Main application root with routing, Web3 wallet integration, and global layout
 * Decentralized architecture - no traditional authentication
 */

import { useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useWalletStore, useSettingsStore } from '@/stores';
import ErrorBoundary from '@/components/ErrorBoundary';
import NotificationCenter from '@/components/NotificationCenter';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Transfer from '@/pages/Transfer';
import Validators from '@/pages/Validators';
import Governance from '@/pages/Governance';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import { Web3AuthProvider } from "@/contexts/Web3AuthContext";

/**
 * Protected Page Layout
 * Shared layout for all authenticated pages with dark mode support
 */
function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

/**
 * Main Router Component
 * Handles all routing and page transitions
 */
function Router() {
    const { wallet } = useWalletStore();
    const { theme, applyTheme } = useSettingsStore();
    const [location] = useLocation();

    // Apply theme on mount and when theme changes
    useEffect(() => {
        applyTheme();
    }, [theme, applyTheme]);

    // Check if we're on a protected page
    const isProtectedPage = ['/dashboard', '/transfer', '/validators', '/governance', '/settings'].includes(location);
    const showLayout = wallet && isProtectedPage;

    return (
        <Switch>
            {/* Public Routes */}
            <Route path="/" component={Landing} />

            {/* Protected Routes - Dashboard */}
            <Route path="/dashboard">
                {showLayout ? (
                    <ProtectedLayout>
                        <Dashboard />
                    </ProtectedLayout>
                ) : (
                    <Landing />
                )}
            </Route>

            {/* Protected Routes - Transfer */}
            <Route path="/transfer">
                {showLayout ? (
                    <ProtectedLayout>
                        <Transfer />
                    </ProtectedLayout>
                ) : (
                    <Landing />
                )}
            </Route>

            {/* Protected Routes - Validators */}
            <Route path="/validators">
                {showLayout ? (
                    <ProtectedLayout>
                        <Validators />
                    </ProtectedLayout>
                ) : (
                    <Landing />
                )}
            </Route>

            {/* Protected Routes - Governance */}
            <Route path="/governance">
                {showLayout ? (
                    <ProtectedLayout>
                        <Governance />
                    </ProtectedLayout>
                ) : (
                    <Landing />
                )}
            </Route>

            {/* Protected Routes - Settings */}
            <Route path="/settings">
                {showLayout ? (
                    <ProtectedLayout>
                        <Settings />
                    </ProtectedLayout>
                ) : (
                    <Landing />
                )}
            </Route>

            {/* 404 Not Found */}
            <Route component={NotFound} />
        </Switch>
    );
}

/**
 * Main App Component
 * Root component with error boundary and global providers
 */
function App() {
    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'https://api.chainsync.org/api/v1';

    return (
        <Web3AuthProvider config={{ apiUrl }}>
        <ErrorBoundary>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                {/* Global Notification Center */}
                <NotificationCenter />

                {/* Router */}
                <Router />
            </div>
        </ErrorBoundary>
        </Web3AuthProvider>
    );
}

export default App;
