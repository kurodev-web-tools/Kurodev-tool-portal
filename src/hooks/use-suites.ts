import { useMemo } from 'react';
import { suites, type Suite } from '@/data/suites';

interface UseSuitesReturn {
  suites: Suite[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * スイートデータを取得するフック
 * 将来的にAPI呼び出しやローカライズ対応を追加可能
 * 
 * @returns スイートデータ、ローディング状態、エラー状態
 */
export function useSuites(): UseSuitesReturn {
  // 現在は直接インポート、将来的にAPI呼び出しに置き換え可能
  // 例: const { data, isLoading, error } = useSWR('/api/suites', fetcher);
  const data = useMemo(() => suites, []);

  return {
    suites: data,
    isLoading: false,
    error: null,
  };
}

