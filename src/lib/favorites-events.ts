/**
 * お気に入り状態同期システム
 * Phase 2: 基盤システムの実装
 */

import { useState, useEffect } from 'react';
import { logger } from './logger';

// お気に入りイベントの型定義
export interface FavoritesEvent {
  type: 'suite-added' | 'suite-removed' | 'tool-added' | 'tool-removed' | 'all-cleared';
  id: string;
  timestamp: number;
}

// イベントリスナーの型定義
export type FavoritesEventListener = (event: FavoritesEvent) => void;

/**
 * お気に入りイベント管理クラス
 */
export class FavoritesEventManager {
  private static instance: FavoritesEventManager;
  private listeners: Set<FavoritesEventListener> = new Set();

  private constructor() {}

  static getInstance(): FavoritesEventManager {
    if (!FavoritesEventManager.instance) {
      FavoritesEventManager.instance = new FavoritesEventManager();
    }
    return FavoritesEventManager.instance;
  }

  // イベントを発火
  emit(event: FavoritesEvent): void {
    logger.debug(`Favorites event emitted: ${event.type}`, { event }, 'FavoritesEventManager');
    
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in favorites event listener', error, 'FavoritesEventManager');
      }
    });
  }

  // リスナーを追加
  addListener(listener: FavoritesEventListener): void {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: FavoritesEventListener): void {
    this.listeners.delete(listener);
  }

  // 全リスナーをクリア
  clearListeners(): void {
    this.listeners.clear();
  }
}

// シングルトンインスタンスをエクスポート
export const favoritesEventManager = FavoritesEventManager.getInstance();

/**
 * お気に入りイベントフック
 */
export function useFavoritesEvents() {
  const [lastEvent, setLastEvent] = useState<FavoritesEvent | null>(null);

  useEffect(() => {
    const handleEvent = (event: FavoritesEvent) => {
      setLastEvent(event);
    };

    favoritesEventManager.addListener(handleEvent);
    return () => favoritesEventManager.removeListener(handleEvent);
  }, []);

  return {
    lastEvent,
    emit: favoritesEventManager.emit.bind(favoritesEventManager),
  };
}

/**
 * コンポーネント間の状態同期用フック
 */
export function useFavoritesSync() {
  const [syncKey, setSyncKey] = useState(0);

  useEffect(() => {
    const handleEvent = () => {
      setSyncKey(prev => prev + 1);
    };

    favoritesEventManager.addListener(handleEvent);
    return () => favoritesEventManager.removeListener(handleEvent);
  }, []);

  return syncKey;
}
