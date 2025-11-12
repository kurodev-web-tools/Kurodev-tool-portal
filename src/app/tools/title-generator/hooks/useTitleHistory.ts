import { useCallback } from 'react';
import { toast } from 'sonner';

import { logger } from '@/lib/logger';
import { usePersistentState } from '@/hooks/usePersistentState';
import type { GenerationHistoryEntry } from '@/types/title-generator';

const HISTORY_STORAGE_KEY = 'history';
const HISTORY_NAMESPACE = 'title-generator';
const HISTORY_VERSION = 1;
export const HISTORY_LIMIT = 50;

export interface UseTitleHistoryResult {
  history: GenerationHistoryEntry[];
  addHistory: (entry: GenerationHistoryEntry) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  isHydrated: boolean;
}

export const useTitleHistory = (limit: number = HISTORY_LIMIT): UseTitleHistoryResult => {
  const [history, setHistory, { reset, isHydrated }] = usePersistentState<GenerationHistoryEntry[]>(
    HISTORY_STORAGE_KEY,
    () => [],
    {
      namespace: HISTORY_NAMESPACE,
      version: HISTORY_VERSION,
      onError: (error) => {
        logger.error('タイトル履歴の復元に失敗しました', error, 'useTitleHistory');
        toast.error('履歴の読み込みに失敗しました');
      },
    },
  );

  const addHistory = useCallback(
    (entry: GenerationHistoryEntry) => {
      setHistory((prev) => {
        const next = [entry, ...prev];
        if (next.length > limit) {
          toast.info(`履歴は${limit}件までです。古いデータを自動的に削除しました。`);
        }
        return next.slice(0, limit);
      });
    },
    [limit, setHistory],
  );

  const removeHistory = useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((item) => item.id !== id));
      toast.success('履歴を削除しました');
    },
    [setHistory],
  );

  const clearHistory = useCallback(() => {
    if (!confirm('すべての履歴を削除しますか？')) return;
    reset();
    toast.success('すべての履歴を削除しました');
  }, [reset]);

  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
    isHydrated,
  };
};

