export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    56: 'BNB Chain',
    250: 'Fantom',
    42161: 'Arbitrum',
    43114: 'Avalanche',
    1088: 'Metis',
    8453: 'Base',
    7000: 'ZetaChain',
    11155111: 'Sepolia',
  };
  return chains[chainId] || 'Unknown Chain';
}

export function getChainSymbol(chainId: number): string {
  const symbols: Record<number, string> = {
    1: 'ETH',
    137: 'MATIC',
    56: 'BNB',
    250: 'FTM',
    42161: 'ARB',
    43114: 'AVAX',
    1088: 'METIS',
    8453: 'BASE',
    7000: 'ZETA',
    11155111: 'SEP',
  };
  return symbols[chainId] || 'UNKNOWN';
}

export function getChainColor(chainId: number): string {
  const colors: Record<number, string> = {
    1: 'from-blue-500 to-blue-600',
    137: 'from-purple-500 to-purple-600',
    56: 'from-yellow-500 to-yellow-600',
    250: 'from-indigo-500 to-indigo-600',
    42161: 'from-cyan-500 to-cyan-600',
    43114: 'from-red-500 to-red-600',
    1088: 'from-green-500 to-green-600',
    8453: 'from-blue-400 to-blue-500',
    7000: 'from-pink-500 to-pink-600',
    11155111: 'from-gray-500 to-gray-600',
  };
  return colors[chainId] || 'from-gray-500 to-gray-600';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
}

export function generateId(prefix = ''): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateFee(amount: string | number, feePercent: number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const fee = (num * feePercent) / 100;
  return fee.toFixed(6);
}

export function calculateTotal(amount: string | number, feePercent: number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const fee = (num * feePercent) / 100;
  const total = num + fee;
  return total.toFixed(6);
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return d.toLocaleDateString();
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
    active: 'bg-green-100 text-green-800 border-green-300',
    passed: 'bg-blue-100 text-blue-800 border-blue-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
}

export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    pending: '⏳',
    processing: '⚙️',
    completed: '✅',
    failed: '❌',
    active: '🟢',
    passed: '✅',
    rejected: '❌',
  };
  return icons[status] || '•';
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function sortByDate<T extends { createdAt?: string; timestamp?: number }>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
    const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

export function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

export function filterBySearch<T>(
  items: T[],
  searchTerm: string,
  searchKeys: (keyof T)[]
): T[] {
  if (!searchTerm) return items;

  const lowerSearch = searchTerm.toLowerCase();
  return items.filter((item) =>
    searchKeys.some((key) => String(item[key]).toLowerCase().includes(lowerSearch))
  );
}
