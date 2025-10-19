'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { favoritesManager } from '@/lib/favorites-storage';
import { favoritesEventManager } from '@/lib/favorites-events';

// スイートデータ（page.tsxと統一）
const suites = [
  {
    id: 'suite-1',
    title: '企画準備',
    description: 'コンテンツの企画から準備までをサポートするツール群。スケジュール管理、台本作成、素材準備などを効率化します。',
    status: 'released' as const,
    href: '/tools/schedule-calendar',
    iconName: 'sparkles',
  },
  {
    id: 'suite-2', 
    title: '動画公開',
    description: 'コンテンツの公開とオーディエンスへのリーチを最大化するツール群。タイトル生成、サムネイル作成、SEO最適化などを自動化します。',
    status: 'development' as const,
    href: '/tools/title-generator',
    iconName: 'trending-up',
  },
  {
    id: 'suite-3',
    title: '配信強化',
    description: 'オーディエンスとのインタラクションを強化するツール群。コメント分析、感情分析、リアルタイム支援などで配信・ライブをサポートします。',
    status: 'development' as const,
    href: '/tools',
    iconName: 'users',
  },
];

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
  isSuite?: boolean;
  suiteId?: string;
  suiteName?: string;
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

  // 統合されたお気に入りツールの状態管理
  const [unifiedFavorites, setUnifiedFavorites] = useState<QuickAccessItem[]>([]);

  // 統合されたお気に入りツールを更新
  const updateUnifiedFavorites = useCallback(() => {
    try {
      const favorites = favoritesManager.getFavorites();
      
      // スイートのお気に入りを取得
      const suiteTools = favorites.suites.map(suiteId => {
        const suite = suites.find(s => s.id === suiteId);
        return suite ? {
          ...suite,
          isSuite: true,
          suiteId: suite.id,
          suiteName: suite.title,
        } : null;
      }).filter(Boolean) as QuickAccessItem[];
      
      // 個別ツールのお気に入りを取得
      const individualTools = favorites.tools.map(toolId => {
        const tool = allTools.find(t => t.id === toolId);
        return tool ? {
          ...tool,
          isSuite: false,
        } : null;
      }).filter(Boolean) as QuickAccessItem[];
      
      // 統合して最大8個に制限
      const unified = [...suiteTools, ...individualTools].slice(0, 8);
      setUnifiedFavorites(unified);
      
      logger.debug(`Updated unified favorites: ${unified.length} items`, 'useQuickAccess');
    } catch (error) {
      logger.error('Failed to get unified favorite tools', error, 'useQuickAccess');
      setUnifiedFavorites([]);
    }
  }, [allTools]);

  // 統合されたお気に入りツールを取得（状態から返す）
  const unifiedFavoriteTools = useCallback(() => {
    return unifiedFavorites;
  }, [unifiedFavorites]);

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
        
        // 統合お気に入りを初期化
        updateUnifiedFavorites();
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
    
    // 統合お気に入りシステムのイベントを監視
    const handleFavoritesChange = () => {
      updateUnifiedFavorites();
    };
    
    favoritesEventManager.addListener(handleFavoritesChange);
    return () => favoritesEventManager.removeListener(handleFavoritesChange);
  }, [updateUnifiedFavorites]);

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

  // お気に入りをトグル（統合システム使用）
  const toggleFavorite = useCallback((tool: QuickAccessItem) => {
    try {
      // スイートかどうかを判定
      const isSuite = tool.id.startsWith('suite-') || tool.isSuite;
      
      logger.debug(`toggleFavorite: ${tool.id}, isSuite: ${isSuite}`, 'useQuickAccess');
      
      if (isSuite) {
        // スイートのお気に入り管理
        const success = favoritesManager.toggleSuite(tool.id);
        if (success) {
          logger.info(`Suite ${tool.id} favorite toggled`, 'useQuickAccess');
        }
      } else {
        // 個別ツールのお気に入り管理
        const success = favoritesManager.toggleTool(tool.id);
        if (success) {
          logger.info(`Tool ${tool.id} favorite toggled`, 'useQuickAccess');
        }
      }

      // 統合お気に入りを更新
      updateUnifiedFavorites();

    } catch (error) {
      logger.error('Failed to toggle favorite', error, 'useQuickAccess');
    }
  }, [updateUnifiedFavorites]);

  // お気に入りかどうかをチェック（統合システム使用）
  const isFavorite = useCallback((toolId: string) => {
    if (!toolId) return false;
    
    // スイートかどうかを判定
    const isSuite = toolId.startsWith('suite-');
    
    const result = favoritesManager.isFavorite(toolId, isSuite ? 'suite' : 'tool');
    
    logger.debug(`isFavorite check: ${toolId}, isSuite: ${isSuite}, result: ${result}`, 'useQuickAccess');
    
    return result;
  }, []);

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
    unifiedFavoriteTools,
  };
}
