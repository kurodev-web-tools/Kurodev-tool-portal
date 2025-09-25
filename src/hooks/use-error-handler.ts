'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorState {
  hasError: boolean;
  message: string | null;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    message: null,
  });

  const setErrorState = useCallback((message: string) => {
    setError({
      hasError: true,
      message,
    });
    toast.error(message);
  }, []);

  const clearError = useCallback(() => {
    setError({
      hasError: false,
      message: null,
    });
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorMessage: string = 'エラーが発生しました'
  ): Promise<T | null> => {
    try {
      clearError();
      return await asyncFn();
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      setErrorState(message);
      return null;
    }
  }, [setErrorState, clearError]);

  return {
    error,
    setError: setErrorState,
    clearError,
    handleAsyncError,
  };
};
