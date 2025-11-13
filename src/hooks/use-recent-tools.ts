import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import type { QuickAccessItem } from './use-quick-access';

const STORAGE_KEY = 'quick-access-recent';
const MAX_RECENT_ITEMS = 5;

/**
 * 最近使用したツールを管理するフック
 * recentToolsの管理をuseQuickAccessから分離
 */
export function useRecentTools() {
  const [recentTools, setRecentTools] = useState<QuickAccessItem[]>([]);

  // ローカルストレージから読み込み
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const items = JSON.parse(stored) as QuickAccessItem[];
          setRecentTools(items.slice(0, MAX_RECENT_ITEMS));
        }
      } catch (error) {
        logger.error('Failed to load recent tools', error, 'useRecentTools');
        setRecentTools([]);
      }
    };

    loadFromStorage();
  }, []);

  // 最近使用したツールに追加
  const addToRecent = useCallback((item: QuickAccessItem) => {
    try {
      setRecentTools((prev) => {
        const now = Date.now();
        const updatedItem = { ...item, lastUsed: now };

        // 既存のアイテムを除外して新しいアイテムを先頭に追加
        const filtered = prev.filter((i) => i.id !== item.id);
        const updated = [updatedItem, ...filtered].slice(0, MAX_RECENT_ITEMS);

        // localStorageに保存
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          logger.error('Failed to save recent tools', error, 'useRecentTools');
        }

        return updated;
      });
    } catch (error) {
      logger.error('Failed to add to recent tools', error, 'useRecentTools');
    }
  }, []);

  // 最近使用したツールをクリア
  const clearRecent = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentTools([]);
    } catch (error) {
      logger.error('Failed to clear recent tools', error, 'useRecentTools');
    }
  }, []);

  return {
    recentTools,
    addToRecent,
    clearRecent,
  };
}

