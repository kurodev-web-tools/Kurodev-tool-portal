/**
 * 統一されたお気に入り管理フック
 * Phase 2: 基盤システムの実装
 */

import { useState, useEffect, useCallback } from 'react';
import { favoritesManager, UnifiedFavoritesData, FavoriteItem } from '@/lib/favorites-storage';
import { QuickAccessItem } from '@/hooks/use-quick-access';
import { logger } from '@/lib/logger';

// お気に入りフックの戻り値の型
export interface UseFavoritesReturn {
  // 状態
  favorites: UnifiedFavoritesData;
  favoriteItems: FavoriteItem[];
  isLoading: boolean;
  
  // アクション
  addSuite: (suiteId: string) => boolean;
  addTool: (toolId: string) => boolean;
  removeSuite: (suiteId: string) => boolean;
  removeTool: (toolId: string) => boolean;
  toggleSuite: (suiteId: string) => boolean;
  toggleTool: (toolId: string) => boolean;
  isFavorite: (id: string, type: 'suite' | 'tool') => boolean;
  clearAll: () => void;
  
  // ユーティリティ
  getFavoriteCount: () => number;
  canAddMore: () => boolean;
}

// 個別ツールとスイートのデータを取得する関数の型
export interface DataProvider {
  getSuiteById: (id: string) => QuickAccessItem | null;
  getToolById: (id: string) => QuickAccessItem | null;
  getAllSuites: () => QuickAccessItem[];
  getAllTools: () => QuickAccessItem[];
}

/**
 * 統一されたお気に入り管理フック
 */
export function useFavorites(dataProvider: DataProvider): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<UnifiedFavoritesData>(() => 
    favoritesManager.getFavorites()
  );
  const [isLoading, setIsLoading] = useState(false);

  // お気に入りアイテムの詳細情報を取得
  const getFavoriteItems = useCallback((): FavoriteItem[] => {
    const items: FavoriteItem[] = [];

    // スイートのお気に入り
    favorites.suites.forEach(suiteId => {
      const suite = dataProvider.getSuiteById(suiteId);
      if (suite) {
        items.push({
          id: suite.id,
          type: 'suite',
          title: suite.title,
          description: suite.description,
          href: suite.href || '/tools',
          iconName: suite.iconName || 'sparkles',
          addedAt: Date.now(), // TODO: 実際の追加時刻を保存
          suiteId: suite.id,
          suiteName: suite.title,
        });
      }
    });

    // 個別ツールのお気に入り
    favorites.tools.forEach(toolId => {
      const tool = dataProvider.getToolById(toolId);
      if (tool) {
        items.push({
          id: tool.id,
          type: 'tool',
          title: tool.title,
          description: tool.description,
          href: tool.href,
          iconName: tool.iconName || 'wrench',
          addedAt: Date.now(), // TODO: 実際の追加時刻を保存
          tags: [], // TODO: タグ情報を追加
        });
      }
    });

    return items;
  }, [favorites, dataProvider]);

  const favoriteItems = getFavoriteItems();

  // お気に入りデータの変更を監視
  useEffect(() => {
    const handleFavoritesChange = (newFavorites: UnifiedFavoritesData) => {
      setFavorites(newFavorites);
    };

    favoritesManager.addListener(handleFavoritesChange);
    return () => favoritesManager.removeListener(handleFavoritesChange);
  }, []);

  // スイートをお気に入りに追加
  const addSuite = useCallback((suiteId: string): boolean => {
    setIsLoading(true);
    try {
      const success = favoritesManager.addSuite(suiteId);
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 個別ツールをお気に入りに追加
  const addTool = useCallback((toolId: string): boolean => {
    setIsLoading(true);
    try {
      const success = favoritesManager.addTool(toolId);
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // スイートをお気に入りから削除
  const removeSuite = useCallback((suiteId: string): boolean => {
    setIsLoading(true);
    try {
      const success = favoritesManager.removeSuite(suiteId);
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 個別ツールをお気に入りから削除
  const removeTool = useCallback((toolId: string): boolean => {
    setIsLoading(true);
    try {
      const success = favoritesManager.removeTool(toolId);
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // スイートのお気に入りをトグル
  const toggleSuite = useCallback((suiteId: string): boolean => {
    setIsLoading(true);
    try {
      const success = favoritesManager.toggleSuite(suiteId);
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 個別ツールのお気に入りをトグル
  const toggleTool = useCallback((toolId: string): boolean => {
    setIsLoading(true);
    try {
      const success = favoritesManager.toggleTool(toolId);
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // お気に入りかどうかをチェック
  const isFavorite = useCallback((id: string, type: 'suite' | 'tool'): boolean => {
    return favoritesManager.isFavorite(id, type);
  }, []);

  // 全お気に入りをクリア
  const clearAll = useCallback(() => {
    setIsLoading(true);
    try {
      favoritesManager.clearAll();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // お気に入り数を取得
  const getFavoriteCount = useCallback((): number => {
    return favorites.suites.length + favorites.tools.length;
  }, [favorites]);

  // さらに追加できるかチェック
  const canAddMore = useCallback((): boolean => {
    return getFavoriteCount() < favorites.maxItems;
  }, [favorites.maxItems, getFavoriteCount]);

  return {
    favorites,
    favoriteItems,
    isLoading,
    addSuite,
    addTool,
    removeSuite,
    removeTool,
    toggleSuite,
    toggleTool,
    isFavorite,
    clearAll,
    getFavoriteCount,
    canAddMore,
  };
}

/**
 * 簡易版お気に入りフック（既存コードとの互換性用）
 */
export function useSimpleFavorites() {
  const [favorites, setFavorites] = useState<UnifiedFavoritesData>(() => 
    favoritesManager.getFavorites()
  );

  useEffect(() => {
    const handleFavoritesChange = (newFavorites: UnifiedFavoritesData) => {
      setFavorites(newFavorites);
    };

    favoritesManager.addListener(handleFavoritesChange);
    return () => favoritesManager.removeListener(handleFavoritesChange);
  }, []);

  const toggleFavorite = useCallback((id: string, type: 'suite' | 'tool') => {
    if (type === 'suite') {
      favoritesManager.toggleSuite(id);
    } else {
      favoritesManager.toggleTool(id);
    }
  }, []);

  const isFavorite = useCallback((id: string, type: 'suite' | 'tool') => {
    return favoritesManager.isFavorite(id, type);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
}
