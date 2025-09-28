import { useState, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  progress: number;
}

interface UseLoadingOptions {
  initialLoading?: boolean;
  delay?: number;
  timeout?: number;
}

export function useLoading(options: UseLoadingOptions = {}) {
  const { initialLoading = false, delay = 0, timeout = 10000 } = options;
  
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    progress: 0
  });

  const startLoading = () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0
    }));
  };

  const stopLoading = () => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100
    }));
  };

  const setError = (error: string) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error,
      progress: 0
    }));
  };

  const setProgress = (progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }));
  };

  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      progress: 0
    });
  };

  // 遅延ローディング
  useEffect(() => {
    if (delay > 0 && state.isLoading) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, isLoading: false }));
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay, state.isLoading]);

  // タイムアウト処理
  useEffect(() => {
    if (state.isLoading && timeout > 0) {
      const timer = setTimeout(() => {
        setError('タイムアウトが発生しました。もう一度お試しください。');
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [state.isLoading, timeout]);

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    setProgress,
    reset
  };
}

// 非同期処理用のローディングフック
export function useAsyncLoading<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const loading = useLoading();
  const [data, setData] = useState<T | null>(null);

  const execute = async () => {
    try {
      loading.startLoading();
      const result = await asyncFunction();
      setData(result);
      loading.stopLoading();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
      loading.setError(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    execute();
  }, dependencies);

  return {
    ...loading,
    data,
    execute
  };
}

// プログレッシブローディング用のフック
export function useProgressiveLoading(steps: number = 5) {
  const loading = useLoading();
  const [currentStep, setCurrentStep] = useState(0);

  const startProgressiveLoading = () => {
    loading.startLoading();
    setCurrentStep(0);
  };

  const nextStep = () => {
    const newStep = currentStep + 1;
    setCurrentStep(newStep);
    const progress = (newStep / steps) * 100;
    loading.setProgress(progress);
    
    if (newStep >= steps) {
      loading.stopLoading();
    }
  };

  const complete = () => {
    loading.stopLoading();
    setCurrentStep(steps);
  };

  return {
    ...loading,
    currentStep,
    totalSteps: steps,
    startProgressiveLoading,
    nextStep,
    complete
  };
}
