import { useCallback } from 'react';

import type { Suite } from '@/data/suites';
import type { QuickAccessItem } from './use-quick-access';
import { logger } from '@/lib/logger';

interface SuiteTrackingOptions {
  addToRecent: (item: QuickAccessItem) => void;
  trackUsage: (suiteId: string, durationMinutes: number) => void;
}

export function useSuiteTracking({ addToRecent, trackUsage }: SuiteTrackingOptions) {
  return useCallback(
    (suite: Suite) => {
      if (!suite.href) {
        logger.warn(`Suite ${suite.id} has no href and cannot be tracked`, 'useSuiteTracking');
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
      } catch (error) {
        logger.error('Failed to track suite usage', error, 'useSuiteTracking');
      }
    },
    [addToRecent, trackUsage],
  );
}

