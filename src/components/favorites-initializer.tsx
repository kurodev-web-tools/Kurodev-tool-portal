/**
 * お気に入りシステム初期化コンポーネント
 * Phase 3: 状態同期システムの実装
 */

'use client';

import { useEffect } from 'react';
import { initializeFavoritesSystem } from '@/lib/favorites-migration';
import { logger } from '@/lib/logger';

export function FavoritesInitializer() {
  useEffect(() => {
    try {
      // お気に入りシステムを初期化
      initializeFavoritesSystem();
    } catch (error) {
      logger.error('Failed to initialize favorites system', error, 'FavoritesInitializer');
    }
  }, []);

  // このコンポーネントは何もレンダリングしない
  return null;
}
