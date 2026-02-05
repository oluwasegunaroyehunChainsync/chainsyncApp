import { useEffect, useState } from 'react';
import { cn } from '@/utils';
import { TransactionProgressData } from '@/stores/transferStore';

interface TransactionProgressDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionProgressData | null;
}

// Chain logo colors/gradients
const CHAIN_COLORS: Record<string, string> = {
  'Ethereum': 'from-blue-500 to-indigo-600',
  'Ethereum Mainnet': 'from-blue-500 to-indigo-600',
  'Sepolia': 'from-blue-400 to-indigo-500',
  'BSC': 'from-yellow-400 to-yellow-600',
  'BSC Mainnet': 'from-yellow-400 to-yellow-600',
  'BSC Testnet': 'from-yellow-300 to-yellow-500',
  'Polygon': 'from-purple-500 to-purple-700',
  'Arbitrum': 'from-blue-600 to-cyan-500',
  'Arbitrum Sepolia': 'from-blue-500 to-cyan-400',
  'Base': 'from-blue-500 to-blue-700',
  'Base Mainnet': 'from-blue-500 to-blue-700',
  'Avalanche': 'from-red-500 to-red-700',
  'Fantom': 'from-blue-400 to-blue-600',
  'ZetaChain': 'from-green-400 to-emerald-600',
  'Localhost': 'from-gray-400 to-gray-600',
};

function getChainGradient(chain: string): string {
  return CHAIN_COLORS[chain] || 'from-gray-400 to-gray-600';
}

function ElapsedTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    const updateTimer = () => {
      const diff = Date.now() - startTime;
      const seconds = Math.floor(diff / 1000) % 60;
      const minutes = Math.floor(diff / 60000);
      setElapsed(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="text-gray-500 dark:text-gray-400 text-sm font-mono">{elapsed}</span>;
}

export default function TransactionProgressDrawer({
  isOpen,
  onClose,
  transaction,
}: TransactionProgressDrawerProps) {
  if (!transaction) return null;

  const completedSteps = transaction.steps.filter(s => s.status === 'completed').length;
  const totalSteps = transaction.steps.length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-hidden flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Progress</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Transaction Summary */}
        <div className="px-6 py-5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {transaction.amount} {transaction.asset}
          </p>

          {/* Chain Flow */}
          <div className="flex items-center gap-3">
            {/* Source Chain */}
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br',
                getChainGradient(transaction.sourceChain)
              )}>
                {transaction.asset.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{transaction.asset}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.sourceChain}</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-1 flex justify-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>

            {/* Destination Chain */}
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br',
                getChainGradient(transaction.destinationChain)
              )}>
                {transaction.asset.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{transaction.asset}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.destinationChain}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{completedSteps}/{totalSteps} steps</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps Timeline */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-1">
            {transaction.steps.map((step, index) => {
              const isLast = index === transaction.steps.length - 1;
              const isActive = step.status === 'in_progress';
              const isCompleted = step.status === 'completed';
              const isFailed = step.status === 'failed';

              return (
                <div key={step.id} className="relative">
                  {/* Vertical Line */}
                  {!isLast && (
                    <div
                      className={cn(
                        'absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-8px)]',
                        isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    />
                  )}

                  <div className="flex gap-4 py-3">
                    {/* Status Icon */}
                    <div className="relative flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : isActive ? (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                        </div>
                      ) : isFailed ? (
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn(
                            'text-sm font-medium',
                            isCompleted ? 'text-gray-900 dark:text-white' :
                            isActive ? 'text-blue-600 dark:text-blue-400' :
                            isFailed ? 'text-red-600 dark:text-red-400' :
                            'text-gray-500 dark:text-gray-400'
                          )}>
                            {step.label}
                          </p>
                          {step.duration && isCompleted && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              took {step.duration}
                            </p>
                          )}
                          {isActive && step.timestamp && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              In progress...
                            </p>
                          )}
                        </div>

                        {/* Action/Info */}
                        <div className="flex-shrink-0">
                          {step.explorerUrl && isCompleted && (
                            <a
                              href={step.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline flex items-center gap-1"
                            >
                              {step.blockNumber ? step.blockNumber : 'Transaction'}
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                          {isActive && step.timestamp && (
                            <ElapsedTimer startTime={step.timestamp} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {transaction.status === 'completed' ? (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Transfer Complete!</span>
            </div>
          ) : transaction.status === 'failed' ? (
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Transfer Failed</span>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Estimated completion: ~2-5 minutes
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                You can close this panel - we'll notify you when complete
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
