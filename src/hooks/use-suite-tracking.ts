import { useCallback } from 'react';
import { toast } from 'sonner';

import type { Suite } from '@/data/suites';
import type { QuickAccessItem } from './use-quick-access';
import { logger } from '@/lib/logger';

interface SuiteTrackingOptions {
  addToRecent: (item: QuickAccessItem) => void;
  trackUsage: (suiteId: string, durationMinutes: number) => void;
}

/**
 * スイートの使用状況を追跡するフック
 * エラーハンドリングを強化し、ユーザーに通知を行う
 */
export function useSuiteTracking({ addToRecent, trackUsage }: SuiteTrackingOptions) {
  return useCallback(
    (suite: Suite) => {
      if (!suite.href) {
        logger.warn(`Suite ${suite.id} has no href and cannot be tracked`, 'useSuiteTracking');
        toast.error('スイートへのリンクが設定されていません');
        return;
      }

      const quickAccessItem: QuickAccessItem = {
        id: suite.id,
        title: suite.title,
        description: suite.description,
        status: suite.status,
        href: suite.href,
        iconName: suite.iconName,
        color: suite.color,
        isSuite: true,
        suiteId: suite.id,
        suiteName: suite.title,
      };

      try {
        addToRecent(quickAccessItem);
        trackUsage(suite.id, 10);
        logger.info(`Suite ${suite.id} tracked successfully`, 'useSuiteTracking');
      } catch (error) {
        logger.error('Failed to track suite usage', error, 'useSuiteTracking');
        toast.error('スイートの使用状況の記録に失敗しました');
        // 必要に応じてロールバック処理を追加
        // 例: ローカルストレージへの保存が失敗した場合の復元処理
      }
    },
    [addToRecent, trackUsage],
  );
}

