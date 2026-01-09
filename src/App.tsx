/**
 * App Component
 * Main application root with routing, Web3 wallet integration, and global layout
 * Decentralized architecture - no traditional authentication
 */

import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useWalletStore } from '@/stores';
import ErrorBoundary from '@/components/ErrorBoundary';
import NotificationCenter from '@/components/NotificationCenter';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Transfer from '@/pages/Transfer';
import Validators from '@/pages/Validators';
import Governance from '@/pages/Governance';
import NotFound from '@/pages/NotFound';
import { Web3AuthProvider } from "@/contexts/Web3AuthContext";

/**
 * Main Router Component
 * Handles all routing and page transitions
 */
function Router() {
    const { wallet } = useWalletStore();
    const [location] = useLocation();

    // Check if we're on a protected page
    const isProtectedPage = ['/dashboard', '/transfer', '/validators', '/governance'].includes(location);
    const showLayout = wallet && isProtectedPage;

    return (
        <Switch>
            {/* Public Routes */}
            <Route path="/" component={Landing} />

            {/* Protected Routes - Dashboard */}
            <Route path="/dashboard">
                {showLayout ? (
                    <div className="flex h-screen bg-gray-50">
                        <Sidebar />
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <Header />
                            <main className="flex-1 overflow-auto">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <Dashboard />
                                </div>
                            </main>
                        </div>
                    </div>
                ) : (
                    <Landing />
                )}
            </Route>

            {/* Protected Routes - Transfer */}
            <Route path="/transfer">
                {showLayout ? (
                    <div className="flex h-screen bg-gray-50">
                        <Sidebar />
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <Header />
                            <main className="flex-1 overflow-auto">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <Transfer />
                                </div>
                            </main>
                        </div>
                    </div>
                ) : (
                    <Landing />
                )}
            </Route>

            {/* Protected Routes - Validators */}
            <Route path="/validators">
                {showLayout ? (
                    <div className="flex h-screen bg-gray-50">
                        <Sidebar />
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <Header />
                            <main className="flex-1 overflow-auto">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <Validators />
                                </div>
                            </main>
                        </div>
                    </div>
                ) : (
                    <Landing />
                )}
            </Route>

            {/* Protected Routes - Governance */}
            <Route path="/governance">
                {showLayout ? (
                    <div className="flex h-screen bg-gray-50">
                        <Sidebar />
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <Header />
                            <main className="flex-1 overflow-auto">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <Governance />
                                </div>
                            </main>
                        </div>
                    </div>
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
    return (
        <web3AuthProvider>
        <ErrorBoundary>
            <div className="min-h-screen bg-white">
                {/* Global Notification Center */}
                <NotificationCenter />

                {/* Router */}
                <Router />
            </div>
        </ErrorBoundary>
        </web3AuthProvider>
    );
}

export default App;
