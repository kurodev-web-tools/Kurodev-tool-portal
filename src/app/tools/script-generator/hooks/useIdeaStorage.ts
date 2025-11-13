import { useState, useRef, useCallback, useEffect } from 'react';
import type { Idea } from '../types';
import {
  STORAGE_KEYS,
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
} from '../types/storage';
import { logger } from '@/lib/logger';

const IDEAS_ORDER_STORAGE_KEY = STORAGE_KEYS.IDEAS_ORDER;

/**
 * ストレージからideasの並び順を読み込む
 */
const loadIdeasOrderFromStorage = (key: string): Record<number, number> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    
    const payload = JSON.parse(raw) as Record<string, number>;
    if (!payload) return {};

    return Object.entries(payload).reduce<Record<number, number>>((acc, [ideaId, order]) => {
      const numericId = Number(ideaId);
      if (Number.isFinite(numericId) && Number.isFinite(order)) {
        acc[numericId] = Number(order);
      }
      return acc;
    }, {});
  } catch (error) {
    logger.warn(`Failed to load ideas order from storage: ${key}`, error, 'useIdeaStorage');
    return {};
  }
};

/**
 * ストレージにideasの並び順を保存する
 */
const saveIdeasOrderToStorage = (key: string, orderMap: Record<number, number>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(orderMap));
  } catch (error) {
    logger.error(`Failed to save ideas order to storage: ${key}`, error, 'useIdeaStorage');
  }
};

/**
 * アイデアのストレージ管理フック
 * お気に入り、並び順、アイデアリストの管理を行う
 */
export function useIdeaStorage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() =>
    loadFavoritesFromStorage(STORAGE_KEYS.FAVORITES),
  );
  const ideasOrderRef = useRef<Record<number, number>>(
    loadIdeasOrderFromStorage(IDEAS_ORDER_STORAGE_KEY),
  );

  // お気に入りの変更をストレージに保存
  useEffect(() => {
    saveFavoritesToStorage(STORAGE_KEYS.FAVORITES, favoriteIds);
  }, [favoriteIds]);

  // 並び順の変更をストレージに保存
  const saveIdeasOrder = useCallback((orderMap: Record<number, number>) => {
    ideasOrderRef.current = orderMap;
    saveIdeasOrderToStorage(IDEAS_ORDER_STORAGE_KEY, orderMap);
  }, []);

  // お気に入りの追加
  const addFavorite = useCallback((ideaId: number) => {
    setFavoriteIds((prev) => {
      const updated = new Set(prev);
      updated.add(ideaId);
      return updated;
    });
  }, []);

  // お気に入りの削除
  const removeFavorite = useCallback((ideaId: number) => {
    setFavoriteIds((prev) => {
      const updated = new Set(prev);
      updated.delete(ideaId);
      return updated;
    });
  }, []);

  // お気に入りのトグル
  const toggleFavorite = useCallback((ideaId: number) => {
    setFavoriteIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(ideaId)) {
        updated.delete(ideaId);
      } else {
        updated.add(ideaId);
      }
      return updated;
    });
  }, []);

  // アイデアの追加
  const addIdea = useCallback((idea: Idea) => {
    setIdeas((prev) => [idea, ...prev]);
  }, []);

  // アイデアの削除
  const removeIdea = useCallback((ideaId: number) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
    removeFavorite(ideaId);
  }, [removeFavorite]);

  // アイデアの更新
  const updateIdea = useCallback((ideaId: number, updates: Partial<Idea>) => {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === ideaId ? { ...idea, ...updates } : idea)),
    );
  }, []);

  // アイデアの並び替え
  const reorderIdeas = useCallback((orderedIdeas: Idea[]) => {
    setIdeas(orderedIdeas);
    const orderMap: Record<number, number> = {};
    orderedIdeas.forEach((idea, index) => {
      orderMap[idea.id] = index;
    });
    saveIdeasOrder(orderMap);
  }, [saveIdeasOrder]);

  // アイデアのクリア
  const clearIdeas = useCallback(() => {
    setIdeas([]);
    ideasOrderRef.current = {};
    saveIdeasOrderToStorage(IDEAS_ORDER_STORAGE_KEY, {});
  }, []);

  return {
    ideas,
    setIdeas,
    favoriteIds,
    ideasOrderRef,
    addIdea,
    removeIdea,
    updateIdea,
    reorderIdeas,
    clearIdeas,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    saveIdeasOrder,
  };
}

