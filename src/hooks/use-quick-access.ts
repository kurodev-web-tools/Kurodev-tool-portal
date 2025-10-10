'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

export interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
  status: 'released' | 'beta' | 'development';
  href: string;
  iconName?: string;
  color?: string;
  lastUsed?: number;
  isFavorite?: boolean;
}

interface QuickAccessState {
  recentTools: QuickAccessItem[];
  favoriteTools: QuickAccessItem[];
  popularTools: QuickAccessItem[];
}

const STORAGE_KEYS = {
  RECENT: 'quick-access-recent',
  FAVORITES: 'quick-access-favorites',
} as const;

const MAX_RECENT_ITEMS = 5;
const MAX_FAVORITE_ITEMS = 8;

export function useQuickAccess(allTools: QuickAccessItem[]) {
  const [state, setState] = useState<QuickAccessState>({
    recentTools: [],
    favoriteTools: [],
    popularTools: [],
  });

  // 人気ツール（固定）
  const popularToolsData: QuickAccessItem[] = [
    {
      id: 'schedule-calendar',
      title: 'スケジュール管理',
      description: '配信・ライブのスケジュールを管理',
      status: 'beta',
      href: '/tools/schedule-calendar',
      iconName: 'calendar',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'script-generator',
      title: '台本生成AI',
      description: 'コンテンツの企画や台本作成をAIがサポート',
      status: 'beta',
      href: '/tools/script-generator',
      iconName: 'brain',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'thumbnail-generator',
      title: 'サムネイル生成',
      description: '動画・コンテンツのサムネイルをAIが自動生成',
      status: 'released',
      href: '/tools/thumbnail-generator',
      iconName: 'image',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  // localStorageからデータを読み込み
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const recentData = localStorage.getItem(STORAGE_KEYS.RECENT);
        const favoritesData = localStorage.getItem(STORAGE_KEYS.FAVORITES);

        const recentTools = recentData ? JSON.parse(recentData) : [];
        const favoriteTools = favoritesData ? JSON.parse(favoritesData) : [];

        setState({
          recentTools: recentTools.slice(0, MAX_RECENT_ITEMS),
          favoriteTools: favoriteTools.slice(0, MAX_FAVORITE_ITEMS),
          popularTools: popularToolsData,
        });
      } catch (error) {
        logger.error('Failed to load quick access data', error, 'useQuickAccess');
        setState({
          recentTools: [],
          favoriteTools: [],
          popularTools: popularToolsData,
        });
      }
    };

    loadFromStorage();
  }, []);

  // ツール使用履歴を追加
  const addToRecent = useCallback((tool: QuickAccessItem) => {
    setState(prevState => {
      const now = Date.now();
      const updatedTool = { ...tool, lastUsed: now };
      
      // 既存のアイテムを除外して新しいアイテムを先頭に追加
      const filteredRecent = prevState.recentTools.filter(item => item.id !== tool.id);
      const newRecentTools = [updatedTool, ...filteredRecent].slice(0, MAX_RECENT_ITEMS);

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(newRecentTools));
      } catch (error) {
        logger.error('Failed to save recent tools', error, 'useQuickAccess');
      }

      return {
        ...prevState,
        recentTools: newRecentTools,
      };
    });
  }, []);

  // お気に入りをトグル
  const toggleFavorite = useCallback((tool: QuickAccessItem) => {
    setState(prevState => {
      const isCurrentlyFavorite = prevState.favoriteTools.some(item => item.id === tool.id);
      
      let newFavoriteTools;
      if (isCurrentlyFavorite) {
        // お気に入りから削除
        newFavoriteTools = prevState.favoriteTools.filter(item => item.id !== tool.id);
      } else {
        // お気に入りに追加
        const updatedTool = { ...tool, isFavorite: true };
        newFavoriteTools = [updatedTool, ...prevState.favoriteTools].slice(0, MAX_FAVORITE_ITEMS);
      }

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavoriteTools));
      } catch (error) {
        logger.error('Failed to save favorite tools', error, 'useQuickAccess');
      }

      return {
        ...prevState,
        favoriteTools: newFavoriteTools,
      };
    });
  }, []);

  // お気に入りかどうかをチェック
  const isFavorite = useCallback((toolId: string) => {
    return state.favoriteTools.some(item => item.id === toolId);
  }, [state.favoriteTools]);

  // 最近使用したツールをクリア
  const clearRecent = useCallback(() => {
    setState(prevState => {
      try {
        localStorage.removeItem(STORAGE_KEYS.RECENT);
      } catch (error) {
        logger.error('Failed to clear recent tools', error, 'useQuickAccess');
      }

      return {
        ...prevState,
        recentTools: [],
      };
    });
  }, []);

  // お気に入りをクリア
  const clearFavorites = useCallback(() => {
    setState(prevState => {
      try {
        localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      } catch (error) {
        logger.error('Failed to clear favorite tools', error, 'useQuickAccess');
      }

      return {
        ...prevState,
        favoriteTools: [],
      };
    });
  }, []);

  return {
    ...state,
    addToRecent,
    toggleFavorite,
    isFavorite,
    clearRecent,
    clearFavorites,
  };
}
