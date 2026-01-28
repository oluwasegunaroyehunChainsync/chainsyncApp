import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Lock, Zap as Lightning, Globe, Shield, Code } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useWalletStore } from "@/stores";
import { AnimatedNetworkGrid } from "@/components/AnimatedNetworkGrid";
import { AnimatedHeroNetwork } from "@/components/AnimatedHeroNetwork";
import { AnimatedCodeBlock, CodeExamples } from "@/components/AnimatedCodeBlock";
import Card from "@/components/Card";
import { useWeb3Auth } from "@/hooks/useWeb3Auth";
import { useWalletDiscovery, type DetectedWallet } from "@/hooks/useWalletDiscovery";

export default function Home() {
    const [scrollY, setScrollY] = useState(0);
    const [, setLocation] = useLocation();
    const { connectWallet } = useWalletStore();
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    // Initialize wallet discovery hook (EIP-6963)
    const { wallets, isDiscovering, hasWallets } = useWalletDiscovery();

    // Initialize Web3 Auth hook
    const web3Auth = useWeb3Auth({
        apiUrl: 'https://api.chainsync.org',
        storageKey: 'chainsync_auth',
        autoRefresh: true,
    });

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleConnectWallet = async (wallet?: DetectedWallet) => {
        try {
            setConnectionError(null);

            // Use the real Web3Auth hook to connect wallet with specific provider
            // This handles the full flow: eth_requestAccounts -> challenge -> sign -> verify
            await web3Auth.connectWallet(wallet?.provider);

            // After web3Auth completes, we need to sync the wallet store for Dashboard
            // The web3Auth state is updated, but we need to read it after the async operation
            // Use a small delay to allow React state to propagate
            await new Promise(resolve => setTimeout(resolve, 100));

            // Read the stored auth data from localStorage (more reliable than hook state after async)
            const storedAuth = localStorage.getItem('chainsync_auth');
            if (storedAuth) {
                const authData = JSON.parse(storedAuth);
                if (authData.address && authData.chainId) {
                    // Sync wallet store with the authenticated address
                    await connectWallet(authData.address, authData.chainId);
                }
            }

            // Close modal and navigate to dashboard
            setShowWalletModal(false);
            setLocation('/dashboard');
        } catch (error: any) {
            console.error('Failed to connect wallet:', error);
            setConnectionError(error?.message || 'Failed to connect wallet. Please try again.');
        }
    };

    const handleLaunchApp = () => {
        // Always show modal first, regardless of wallet state
        // Let user select wallet, then navigate after connection
        setShowWalletModal(true);
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
            <AnimatedNetworkGrid />
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-[#E8E8E8]/20">
                <div className="container flex items-center justify-between h-16 md:h-20 px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        {/*<img src="/chainsync_logo_v1.png" alt="ChainSync" className="h-8 md:h-10" />*/}
                        <span className="text-lg md:text-xl font-bold glow-green hidden sm:inline">ChainSync</span>
                    </div>

                    {/* Desktop Navigation - hidden on mobile */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-white hover:text-[#E8E8E8] transition-all">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-white hover:text-[#E8E8E8] transition-all">
                            How It Works
                        </a>
                        <a href="#developers" className="text-white hover:text-[#E8E8E8] transition-all">
                            Developers
                        </a>
                        <a href="#ecosystem" className="text-white hover:text-[#E8E8E8] transition-all">
                            Ecosystem
                        </a>
                        <Button
                            onClick={handleLaunchApp}
                            className="bg-[#E8E8E8] text-black hover:bg-[#E8E8E8]/80 font-bold text-base"
                        >
                            Launch App
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-[#E8E8E8] hover:bg-[#E8E8E8]/20 transition-all"
                            aria-label="Toggle menu"
                        >
                            {/* Hamburger icon */}
                            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                                <span className={`block h-0.5 w-6 bg-current transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                                <span className={`block h-0.5 w-6 bg-current transition-all ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                <span className={`block h-0.5 w-6 bg-current transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                <div className={`md:hidden fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-[#E8E8E8]/20 transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                }`}>
                    <div className="px-4 py-6 space-y-6">
                        <div className="flex flex-col space-y-4">
                            <a
                                href="#features"
                                className="text-base font-medium hover:text-[#E8E8E8] transition-all py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="text-base font-medium hover:text-[#E8E8E8] transition-all py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                How It Works
                            </a>
                            <a
                                href="#developers"
                                className="text-base font-medium hover:text-[#E8E8E8] transition-all py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Developers
                            </a>
                            <a
                                href="#ecosystem"
                                className="text-base font-medium hover:text-[#E8E8E8] transition-all py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Ecosystem
                            </a>
                        </div>
                        <Button
                            className="w-full bg-[#E8E8E8] text-black hover:bg-[#E8E8E8]/80 font-bold text-base py-3"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                handleLaunchApp();
                            }}
                        >
                            Launch App
                        </Button>
                    </div>
                </div>
            </nav>
            {/* Hero Section */}
            <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-4 overflow-hidden z-10">
                <AnimatedHeroNetwork />

                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-neon opacity-30 blur-3xl" style={{
                    transform: `translateY(${scrollY * 0.5}px)`
                }} />

                <div className="container relative z-10">
                    <div className="max-w-4xl mx-auto text-center animate-float-up">
                        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                            <span className="glow-green">The Universal</span>
                            <br />
                            <span className="glow-cyan">Settlement Layer</span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                            ChainSync enables frictionless token transfers between any blockchain networks without requiring approval or liquidity dependencies. <span className="glow-green font-bold">No wrap. No risk. Pure finality.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4 sm:px-0">
                            <Button
                                size="lg"
                                onClick={handleLaunchApp}
                                className="bg-[#E8E8E8] text-black hover:bg-[#E8E8E8]/80 font-bold text-base md:text-lg px-6 w-full sm:w-auto py-3"
                            >
                                Launch App <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2]/10 font-bold text-base md:text-lg px-8 w-full sm:w-auto py-3">
                                Read Whitepaper
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mt-16">
                            <div className="border-l-2 border-[#E8E8E8] pl-4">
                                <div className="text-xl sm:text-2xl md:text-3xl font-bold glow-green">0.1%</div>
                                <div className="text-sm text-gray-400">Transaction Fee</div>
                            </div>
                            <div className="border-l-2 border-[#4A90E2] pl-4">
                                <div className="text-xl sm:text-2xl md:text-3xl font-bold glow-cyan">3-7s</div>
                                <div className="text-sm text-gray-400">Settlement Time</div>
                            </div>
                            <div className="border-l-2 border-[#708090] pl-4">
                                <div className="text-xl sm:text-2xl md:text-3xl font-bold glow-magenta">∞</div>
                                <div className="text-sm text-gray-400">Chain Support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem & Solution Section */}
            <section className="py-20 md:py-32 px-4 border-t border-[#E8E8E8]/20 relative z-10">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                        {/* Problem */}
                        <div className="animate-slide-in-left">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                <span className="glow-magenta">The Problem</span>
                            </h2>
                            <div className="space-y-4">
                                <p className="text-gray-300 text-lg">
                                    Current cross-chain solutions are fundamentally broken:
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <span className="text-[#708090] font-bold">→</span>
                                        <span>Slow & costly relayers with high latency</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-[#708090] font-bold">→</span>
                                        <span>Wrapped tokens introduce systemic risk</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-[#708090] font-bold">→</span>
                                        <span>$2.5B+ in bridge hacks due to centralization</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-[#708090] font-bold">→</span>
                                        <span>Complex user flows requiring multiple approvals</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Solution */}
                        <div className="animate-slide-in-right">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                <span className="glow-cyan">The Solution</span>
                            </h2>
                            <div className="space-y-4">
                                <p className="text-gray-300 text-lg">
                                    ChainSync replaces custodial liquidity with cryptographic proof:
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <span className="text-[#4A90E2] font-bold">✓</span>
                                        <span>Instant finality with zero-knowledge proofs</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-[#4A90E2] font-bold">✓</span>
                                        <span>Native assets, no wrapped tokens</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-[#4A90E2] font-bold">✓</span>
                                        <span>Decentralized validator consensus</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-[#4A90E2] font-bold">✓</span>
                                        <span>One-click transfers with no approvals</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 md:py-32 px-4 relative z-10">
                <div className="container">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
                        <span className="glow-cyan">Key Features</span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="w-8 h-8" />,
                                title: "Instant Settlement",
                                description: "3-7 second finality across any blockchain with cryptographic guarantees"
                            },
                            {
                                icon: <Shield className="w-8 h-8" />,
                                title: "Non-Custodial",
                                description: "Your assets never leave your wallet. Pure peer-to-peer transfers."
                            },
                            {
                                icon: <Globe className="w-8 h-8" />,
                                title: "Universal Support",
                                description: "Transfer between any blockchain - Ethereum, Polygon, BNB, Arbitrum, and more"
                            },
                            {
                                icon: <Lock className="w-8 h-8" />,
                                title: "Secure & Audited",
                                description: "Battle-tested cryptography with formal verification and security audits"
                            },
                            {
                                icon: <Code className="w-8 h-8" />,
                                title: "Developer Friendly",
                                description: "Simple REST API and SDK for seamless integration into your apps"
                            },
                            {
                                icon: <Lightning className="w-8 h-8" />,
                                title: "Low Fees",
                                description: "0.1% transaction fee with no hidden charges or slippage"
                            }
                        ].map((feature, index) => (
                            <div key={index} className="p-6 border border-[#E8E8E8]/20 rounded-lg hover:border-[#4A90E2]/50 transition-all">
                                <div className="text-[#4A90E2] mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 md:py-32 px-4 border-t border-[#E8E8E8]/20 relative z-10">
                <div className="container">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
                        <span className="glow-green">How It Works</span>
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: "1", title: "Connect", description: "Link your Web3 wallet" },
                            { step: "2", title: "Select", description: "Choose source and destination chains" },
                            { step: "3", title: "Transfer", description: "Approve and execute the transfer" },
                            { step: "4", title: "Receive", description: "Assets arrive instantly on destination chain" }
                        ].map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                                    {item.step}
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-400">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Developers Section */}
            <section id="developers" className="py-20 md:py-32 px-4 border-t border-[#E8E8E8]/20 relative z-10">
                <div className="container">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
                        <span className="glow-magenta">For Developers</span>
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <AnimatedCodeBlock code={CodeExamples.crossChainTransfer} />
                    </div>
                </div>
            </section>

            {/* Ecosystem Section */}
            <section id="ecosystem" className="py-20 md:py-32 px-4 border-t border-[#E8E8E8]/20 relative z-10">
                <div className="container">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
                        <span className="glow-cyan">Supported Chains</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-white">
                        {["Ethereum", "Polygon", "BNB Chain", "Arbitrum", "Avalanche", "Fantom", "Metis", "Base", "ZetaChain"].map((chain, index) => (
                            <div key={index} className="p-6 border border-[#E8E8E8]/20 rounded-lg text-center hover:border-[#4A90E2]/50 transition-all">
                                <p className="font-semibold">{chain}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 px-4 border-t border-[#E8E8E8]/20 relative z-10">
                <div className="container text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        <span className="glow-green">Ready to Settle?</span>
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join the revolution of frictionless cross-chain transfers
                    </p>
                    <Button
                        size="lg"
                        onClick={handleLaunchApp}
                        className="bg-[#E8E8E8] text-black hover:bg-[#E8E8E8]/80 font-bold text-base md:text-lg px-8"
                    >
                        Launch App <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </section>

            {/* Foote
            r */}
            <footer className="border-t border-[#E8E8E8]/20 py-12 px-4 relative z-10">
                <div className="container">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold mb-4 text-white">ChainSync</h3>
                            <p className="text-gray-400">Universal cross-chain settlement layer</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#features" className="hover:text-[#E8E8E8]">Features</a></li>
                                <li><a href="#how-it-works" className="hover:text-[#E8E8E8]">How It Works</a></li>
                                <li><a href="#" className="hover:text-[#E8E8E8]">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Developers</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-[#E8E8E8]">Documentation</a></li>
                                <li><a href="#" className="hover:text-[#E8E8E8]">API Reference</a></li>
                                <li><a href="#" className="hover:text-[#E8E8E8]">GitHub</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Community</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-[#E8E8E8]">Discord</a></li>
                                <li><a href="#" className="hover:text-[#E8E8E8]">Twitter</a></li>
                                <li><a href="#" className="hover:text-[#E8E8E8]">Governance</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-[#E8E8E8]/20 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
                        <p>&copy; 2025 ChainSync. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-[#E8E8E8]">Privacy Policy</a>
                            <a href="#" className="hover:text-[#E8E8E8]">Terms of Service</a>
                            <a href="#" className="hover:text-[#E8E8E8]">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Wallet Connection Modal */}
            {showWalletModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card variant="elevated" className="w-full max-w-md mx-4">
                        <Card.Header className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Connect Wallet</h2>
                            <button
                                onClick={() => {
                                    setShowWalletModal(false);
                                    setConnectionError(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </Card.Header>
                        <Card.Body className="space-y-4">
                            {connectionError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{connectionError}</p>
                                </div>
                            )}

                            <p className="text-sm text-gray-600">
                                Connect your wallet to access ChainSync. You'll be asked to sign a message to verify ownership.
                            </p>

                            {/* Wallet Options */}
                            <div className="space-y-2">
                                {isDiscovering ? (
                                    <div className="flex items-center justify-center p-4">
                                        <span className="animate-spin mr-2">⟳</span>
                                        <span className="text-gray-600">Detecting wallets...</span>
                                    </div>
                                ) : hasWallets ? (
                                    <>
                                        {wallets.map((wallet) => (
                                            <button
                                                type="button"
                                                key={wallet.id}
                                                onClick={() => handleConnectWallet(wallet)}
                                                disabled={web3Auth.isLoading}
                                                className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors font-medium text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                            >
                                                <img
                                                    src={wallet.icon}
                                                    alt={wallet.name}
                                                    className="w-8 h-8 rounded-lg"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                                <span className="flex-1 text-left">
                                                    {web3Auth.isLoading ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="animate-spin">⟳</span>
                                                            Connecting...
                                                        </span>
                                                    ) : (
                                                        wallet.name
                                                    )}
                                                </span>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                    Detected
                                                </span>
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <div className="text-center p-4 text-gray-500">
                                        <p>No wallets detected.</p>
                                        <p className="text-sm mt-2">
                                            Please install a Web3 wallet like{' '}
                                            <a
                                                href="https://metamask.io/download"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                MetaMask
                                            </a>
                                        </p>
                                    </div>
                                )}

                                {/* WalletConnect - Coming Soon */}
                                <button
                                    disabled={true}
                                    className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 font-medium text-gray-400 cursor-not-allowed flex items-center gap-3"
                                >
                                    <span className="text-2xl">🔗</span>
                                    <span className="flex-1 text-left">WalletConnect</span>
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                        Coming Soon
                                    </span>
                                </button>
                            </div>

                            <div className="text-xs text-gray-500 text-center pt-2">
                                {!window.ethereum && (
                                    <p className="text-orange-600">
                                        ⚠️ No wallet detected. Please install a Web3 wallet to continue.
                                    </p>
                                )}
                                <p className="mt-2">
                                    New to Web3 wallets?{' '}
                                    <a
                                        href="https://metamask.io/download"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Get MetaMask
                                    </a>
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </div>
    );
}