/**
 * お気に入り機能のユーティリティ関数
 * Phase 2: 基盤システムの実装
 */

import { favoritesManager, UnifiedFavoritesData } from './favorites-storage';
import { QuickAccessItem } from '@/hooks/use-quick-access';

/**
 * 既存のlocalStorageデータを新しい構造に移行
 */
export function migrateLegacyFavorites(): void {
  try {
    // 既存の個別ツールお気に入りを取得
    const legacyTools = localStorage.getItem('quick-access-favorites');
    const legacySuites = localStorage.getItem('vtuber-tools-suite-favorites');
    
    const currentFavorites = favoritesManager.getFavorites();
    
    // 個別ツールのお気に入りを移行
    if (legacyTools) {
      try {
        const toolIds = JSON.parse(legacyTools);
        if (Array.isArray(toolIds)) {
          toolIds.forEach(toolId => {
            if (!currentFavorites.tools.includes(toolId)) {
              favoritesManager.addTool(toolId);
            }
          });
        }
      } catch (error) {
        console.warn('Failed to migrate legacy tool favorites:', error);
      }
    }
    
    // スイートのお気に入りを移行
    if (legacySuites) {
      try {
        const suiteIds = JSON.parse(legacySuites);
        if (Array.isArray(suiteIds)) {
          suiteIds.forEach(suiteId => {
            if (!currentFavorites.suites.includes(suiteId)) {
              favoritesManager.addSuite(suiteId);
            }
          });
        }
      } catch (error) {
        console.warn('Failed to migrate legacy suite favorites:', error);
      }
    }
    
    // 移行完了後、古いデータをクリア
    localStorage.removeItem('quick-access-favorites');
    localStorage.removeItem('vtuber-tools-suite-favorites');
    
    console.log('Legacy favorites migration completed');
  } catch (error) {
    console.error('Failed to migrate legacy favorites:', error);
  }
}

/**
 * お気に入りデータの整合性をチェック
 */
export function validateFavoritesIntegrity(): boolean {
  try {
    const favorites = favoritesManager.getFavorites();
    
    // 基本的な構造チェック
    if (!Array.isArray(favorites.suites) || !Array.isArray(favorites.tools)) {
      return false;
    }
    
    // 重複チェック
    const suiteSet = new Set(favorites.suites);
    const toolSet = new Set(favorites.tools);
    
    if (suiteSet.size !== favorites.suites.length || toolSet.size !== favorites.tools.length) {
      return false;
    }
    
    // 最大件数チェック
    if (favorites.suites.length + favorites.tools.length > favorites.maxItems) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to validate favorites integrity:', error);
    return false;
  }
}

/**
 * お気に入りデータをリセット
 */
export function resetFavorites(): void {
  try {
    favoritesManager.clearAll();
    console.log('Favorites data reset completed');
  } catch (error) {
    console.error('Failed to reset favorites:', error);
  }
}

/**
 * お気に入り統計を取得
 */
export function getFavoritesStats(): {
  totalCount: number;
  suiteCount: number;
  toolCount: number;
  maxItems: number;
  usagePercentage: number;
} {
  const favorites = favoritesManager.getFavorites();
  const totalCount = favorites.suites.length + favorites.tools.length;
  
  return {
    totalCount,
    suiteCount: favorites.suites.length,
    toolCount: favorites.tools.length,
    maxItems: favorites.maxItems,
    usagePercentage: Math.round((totalCount / favorites.maxItems) * 100),
  };
}

/**
 * デバッグ用: お気に入りデータをコンソールに出力
 */
export function debugFavorites(): void {
  const favorites = favoritesManager.getFavorites();
  const stats = getFavoritesStats();
  
  console.group('🔖 Favorites Debug Info');
  console.log('Raw data:', favorites);
  console.log('Statistics:', stats);
  console.log('Integrity check:', validateFavoritesIntegrity());
  console.groupEnd();
}
