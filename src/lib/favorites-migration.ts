/**
 * お気に入りデータ移行システム
 * Phase 3: 状態同期システムの実装
 */

import { favoritesManager } from './favorites-storage';
import { logger } from './logger';

/**
 * 既存のlocalStorageデータを新しい構造に移行
 */
export function migrateLegacyFavorites(): boolean {
  try {
    logger.info('Starting legacy favorites migration', 'MigrationSystem');
    
    // 既存の個別ツールお気に入りを取得
    const legacyTools = localStorage.getItem('quick-access-favorites');
    const legacySuites = localStorage.getItem('vtuber-tools-suite-favorites');
    
    const currentFavorites = favoritesManager.getFavorites();
    let migratedCount = 0;
    
    // 個別ツールのお気に入りを移行
    if (legacyTools) {
      try {
        const toolIds = JSON.parse(legacyTools);
        if (Array.isArray(toolIds)) {
          toolIds.forEach(toolId => {
            if (!currentFavorites.tools.includes(toolId)) {
              const success = favoritesManager.addTool(toolId);
              if (success) migratedCount++;
            }
          });
        }
      } catch (error) {
        logger.warn('Failed to migrate legacy tool favorites', error, 'MigrationSystem');
      }
    }
    
    // スイートのお気に入りを移行
    if (legacySuites) {
      try {
        const suiteIds = JSON.parse(legacySuites);
        if (Array.isArray(suiteIds)) {
          suiteIds.forEach(suiteId => {
            if (!currentFavorites.suites.includes(suiteId)) {
              const success = favoritesManager.addSuite(suiteId);
              if (success) migratedCount++;
            }
          });
        }
      } catch (error) {
        logger.warn('Failed to migrate legacy suite favorites', error, 'MigrationSystem');
      }
    }
    
    // 移行完了後、古いデータをクリア
    if (migratedCount > 0) {
      localStorage.removeItem('quick-access-favorites');
      localStorage.removeItem('vtuber-tools-suite-favorites');
      logger.info(`Legacy favorites migration completed. Migrated ${migratedCount} items`, 'MigrationSystem');
    } else {
      logger.info('No legacy favorites to migrate', 'MigrationSystem');
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to migrate legacy favorites', error, 'MigrationSystem');
    return false;
  }
}

/**
 * 移行が必要かどうかをチェック
 */
export function needsMigration(): boolean {
  try {
    const legacyTools = localStorage.getItem('quick-access-favorites');
    const legacySuites = localStorage.getItem('vtuber-tools-suite-favorites');
    
    return !!(legacyTools || legacySuites);
  } catch (error) {
    logger.error('Failed to check migration needs', error, 'MigrationSystem');
    return false;
  }
}

/**
 * 移行の実行（アプリケーション起動時に呼び出し）
 */
export function initializeFavoritesSystem(): void {
  try {
    // 移行が必要かチェック
    if (needsMigration()) {
      logger.info('Legacy favorites detected, starting migration', 'MigrationSystem');
      migrateLegacyFavorites();
    } else {
      logger.info('No legacy favorites found, using existing system', 'MigrationSystem');
    }
    
    // データ整合性チェック
    const favorites = favoritesManager.getFavorites();
    logger.info(`Favorites system initialized: ${favorites.suites.length} suites, ${favorites.tools.length} tools, max ${favorites.maxItems}`, 'MigrationSystem');
    
  } catch (error) {
    logger.error('Failed to initialize favorites system', error, 'MigrationSystem');
  }
}
