/**
 * 統一されたお気に入り管理システム
 * Phase 2: 基盤システムの実装
 */

import { logger } from './logger';
import { favoritesEventManager, FavoritesEvent } from './favorites-events';

// 統一されたlocalStorageキー
export const FAVORITES_STORAGE_KEYS = {
  UNIFIED: 'vtuber-tools-favorites-unified',
  SUITES: 'vtuber-tools-favorites-suites',
  TOOLS: 'vtuber-tools-favorites-tools',
  RECENT: 'vtuber-tools-recent',
} as const;

// お気に入りアイテムの型定義
export interface FavoriteItem {
  id: string;
  type: 'suite' | 'tool';
  title: string;
  description: string;
  href: string;
  iconName: string;
  addedAt: number;
  lastUsed?: number;
  // スイート固有の情報
  suiteId?: string;
  suiteName?: string;
  // 個別ツール固有の情報
  category?: string;
  tags?: string[];
}

// 統一されたお気に入りデータ構造
export interface UnifiedFavoritesData {
  suites: string[]; // スイートIDの配列
  tools: string[];  // 個別ツールIDの配列
  maxItems: number; // 最大件数（デフォルト8）
}

// お気に入り管理クラス
export class FavoritesManager {
  private static instance: FavoritesManager;
  private listeners: Set<(data: UnifiedFavoritesData) => void> = new Set();

  private constructor() {}

  static getInstance(): FavoritesManager {
    if (!FavoritesManager.instance) {
      FavoritesManager.instance = new FavoritesManager();
    }
    return FavoritesManager.instance;
  }

  // 安全なJSONパース関数
  private safeJsonParse(data: string): { success: boolean; result?: any; error?: Error } {
    // まず基本的な文字列チェック
    if (!data || typeof data !== 'string') {
      return { success: false, error: new Error('Invalid input data') };
    }

    // 空文字列のチェック
    if (data.trim() === '') {
      return { success: false, error: new Error('Empty data') };
    }

    // JSONの基本的な構文チェック
    if (!data.startsWith('{') && !data.startsWith('[')) {
      return { success: false, error: new Error(`Invalid JSON format: data "${data}" does not start with { or [`) };
    }

    try {
      // JSON.parseを実行
      const result = JSON.parse(data);
      return { success: true, result };
    } catch (error) {
      // エラーを適切に処理
      const errorMessage = error instanceof Error ? error.message : 'Unknown JSON parse error';
      return { success: false, error: new Error(errorMessage) };
    }
  }

  // お気に入りデータを取得
  getFavorites(): UnifiedFavoritesData {
    try {
      const data = localStorage.getItem(FAVORITES_STORAGE_KEYS.UNIFIED);
      logger.debug(`Loading favorites data: ${data ? 'found' : 'not found'}`, 'FavoritesManager');
      
      if (data) {
        const parseResult = this.safeJsonParse(data);
        
        if (!parseResult.success) {
          logger.warn('Invalid JSON data detected, clearing and using default', parseResult.error, 'FavoritesManager');
          logger.debug(`Invalid JSON data: ${data}`, 'FavoritesManager');
          // 無効なJSONデータをクリア
          try {
            localStorage.removeItem(FAVORITES_STORAGE_KEYS.UNIFIED);
            logger.debug('Cleared invalid JSON data from localStorage', 'FavoritesManager');
          } catch (clearError) {
            logger.error('Failed to clear invalid JSON data', clearError, 'FavoritesManager');
          }
          return this.getDefaultFavorites();
        }

        const parsed = parseResult.result;
        logger.debug('Successfully parsed JSON data', 'FavoritesManager');

        // データの整合性をチェック
        try {
          if (this.validateFavoritesData(parsed)) {
            logger.debug('Data validation passed', 'FavoritesManager');
            return parsed;
          } else {
            logger.warn('Invalid favorites data structure detected, resetting to default', 'FavoritesManager');
            // JSON.stringifyも安全に実行
            try {
              logger.debug(`Invalid data structure: ${JSON.stringify(parsed)}`, 'FavoritesManager');
            } catch (stringifyError) {
              logger.debug('Failed to stringify invalid data structure', 'FavoritesManager');
            }
            // 無効なデータ構造をクリア
            try {
              localStorage.removeItem(FAVORITES_STORAGE_KEYS.UNIFIED);
              logger.debug('Cleared invalid data structure from localStorage', 'FavoritesManager');
            } catch (clearError) {
              logger.error('Failed to clear invalid data structure', clearError, 'FavoritesManager');
            }
            return this.getDefaultFavorites();
          }
        } catch (validationError) {
          logger.error('Error during data validation', validationError, 'FavoritesManager');
          return this.getDefaultFavorites();
        }
      }
    } catch (error) {
      logger.error('Failed to load favorites from localStorage', error, 'FavoritesManager');
    }

    logger.debug('Returning default favorites data', 'FavoritesManager');
    return this.getDefaultFavorites();
  }

  // お気に入りデータを保存
  saveFavorites(data: UnifiedFavoritesData): void {
    try {
      // データの整合性をチェック
      if (!this.validateFavoritesData(data)) {
        logger.error('Invalid favorites data provided for saving', 'FavoritesManager');
        return;
      }

      localStorage.setItem(FAVORITES_STORAGE_KEYS.UNIFIED, JSON.stringify(data));
      this.notifyListeners(data);
      logger.debug('Favorites data saved successfully', 'FavoritesManager');
    } catch (error) {
      logger.error('Failed to save favorites', error, 'FavoritesManager');
    }
  }

  // スイートをお気に入りに追加
  addSuite(suiteId: string): boolean {
    const favorites = this.getFavorites();
    
    if (favorites.suites.includes(suiteId)) {
      logger.debug(`Suite ${suiteId} is already in favorites`, 'FavoritesManager');
      return false; // 既に存在
    }

    if (favorites.suites.length + favorites.tools.length >= favorites.maxItems) {
      logger.warn(`Maximum favorites limit reached (${favorites.maxItems})`, 'FavoritesManager');
      return false; // 最大件数に達している
    }

    favorites.suites.push(suiteId);
    this.saveFavorites(favorites);
    
    // イベントを発火
    favoritesEventManager.emit({
      type: 'suite-added',
      id: suiteId,
      timestamp: Date.now(),
    });
    
    logger.info(`Suite ${suiteId} added to favorites`, 'FavoritesManager');
    return true;
  }

  // 個別ツールをお気に入りに追加
  addTool(toolId: string): boolean {
    const favorites = this.getFavorites();
    
    if (favorites.tools.includes(toolId)) {
      logger.debug(`Tool ${toolId} is already in favorites`, 'FavoritesManager');
      return false; // 既に存在
    }

    if (favorites.suites.length + favorites.tools.length >= favorites.maxItems) {
      logger.warn(`Maximum favorites limit reached (${favorites.maxItems})`, 'FavoritesManager');
      return false; // 最大件数に達している
    }

    favorites.tools.push(toolId);
    this.saveFavorites(favorites);
    
    // イベントを発火
    favoritesEventManager.emit({
      type: 'tool-added',
      id: toolId,
      timestamp: Date.now(),
    });
    
    logger.info(`Tool ${toolId} added to favorites`, 'FavoritesManager');
    return true;
  }

  // スイートをお気に入りから削除
  removeSuite(suiteId: string): boolean {
    const favorites = this.getFavorites();
    const index = favorites.suites.indexOf(suiteId);
    
    if (index === -1) {
      logger.debug(`Suite ${suiteId} not found in favorites`, 'FavoritesManager');
      return false; // 存在しない
    }

    favorites.suites.splice(index, 1);
    this.saveFavorites(favorites);
    
    // イベントを発火
    favoritesEventManager.emit({
      type: 'suite-removed',
      id: suiteId,
      timestamp: Date.now(),
    });
    
    logger.info(`Suite ${suiteId} removed from favorites`, 'FavoritesManager');
    return true;
  }

  // 個別ツールをお気に入りから削除
  removeTool(toolId: string): boolean {
    const favorites = this.getFavorites();
    const index = favorites.tools.indexOf(toolId);
    
    if (index === -1) {
      logger.debug(`Tool ${toolId} not found in favorites`, 'FavoritesManager');
      return false; // 存在しない
    }

    favorites.tools.splice(index, 1);
    this.saveFavorites(favorites);
    
    // イベントを発火
    favoritesEventManager.emit({
      type: 'tool-removed',
      id: toolId,
      timestamp: Date.now(),
    });
    
    logger.info(`Tool ${toolId} removed from favorites`, 'FavoritesManager');
    return true;
  }

  // お気に入りかどうかをチェック
  isFavorite(id: string, type: 'suite' | 'tool'): boolean {
    const favorites = this.getFavorites();
    return type === 'suite' 
      ? favorites.suites.includes(id)
      : favorites.tools.includes(id);
  }

  // スイートのお気に入りをトグル
  toggleSuite(suiteId: string): boolean {
    if (this.isFavorite(suiteId, 'suite')) {
      return this.removeSuite(suiteId);
    } else {
      return this.addSuite(suiteId);
    }
  }

  // 個別ツールのお気に入りをトグル
  toggleTool(toolId: string): boolean {
    if (this.isFavorite(toolId, 'tool')) {
      return this.removeTool(toolId);
    } else {
      return this.addTool(toolId);
    }
  }

  // リスナーを追加
  addListener(listener: (data: UnifiedFavoritesData) => void): void {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (data: UnifiedFavoritesData) => void): void {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners(data: UnifiedFavoritesData): void {
    this.listeners.forEach(listener => listener(data));
  }

  // 全お気に入りをクリア
  clearAll(): void {
    this.saveFavorites({
      suites: [],
      tools: [],
      maxItems: 8,
    });
  }

  // データの整合性をチェック
  private validateFavoritesData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.suites) &&
      Array.isArray(data.tools) &&
      typeof data.maxItems === 'number' &&
      data.maxItems > 0
    );
  }

  // デフォルトのお気に入りデータを取得
  private getDefaultFavorites(): UnifiedFavoritesData {
    return {
      suites: [],
      tools: [],
      maxItems: 8,
    };
  }
}

// シングルトンインスタンスをエクスポート
export const favoritesManager = FavoritesManager.getInstance();
