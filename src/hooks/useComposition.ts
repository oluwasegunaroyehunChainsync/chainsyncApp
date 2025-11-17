import { useState, useCallback } from 'react';

interface DialogCompositionState {
  isComposing: boolean;
  justEndedComposing: () => boolean;
  setComposing: (value: boolean) => void;
  markCompositionEnd: () => void;
}

export function useComposition<T extends HTMLElement = HTMLInputElement>(
  handlers?: {
    onKeyDown?: (e: React.KeyboardEvent<T>) => void;
    onCompositionStart?: (e: React.CompositionEvent<T>) => void;
    onCompositionEnd?: (e: React.CompositionEvent<T>) => void;
  }
) {
  const [isComposing, setIsComposing] = useState(false);
  const [compositionEnded, setCompositionEnded] = useState(false);

  const justEndedComposing = useCallback(() => {
    return compositionEnded;
  }, [compositionEnded]);

  const markCompositionEnd = useCallback(() => {
    setCompositionEnded(true);
  }, []);

  const handleCompositionStart = useCallback((e: React.CompositionEvent<T>) => {
    setIsComposing(true);
    setCompositionEnded(false);
    handlers?.onCompositionStart?.(e);
  }, [handlers]);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<T>) => {
    setIsComposing(false);
    markCompositionEnd();
    setTimeout(() => setCompositionEnded(false), 100);
    handlers?.onCompositionEnd?.(e);
  }, [handlers, markCompositionEnd]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<T>) => {
    handlers?.onKeyDown?.(e);
  }, [handlers]);

  return {
    isComposing,
    setIsComposing,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  };
}



