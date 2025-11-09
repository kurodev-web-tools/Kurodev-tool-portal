import { useCallback } from 'react';

import type { QuickAccessItem } from './use-quick-access';
import { logger } from '@/lib/logger';

type TrackableTool = Pick<
  import('@/data/tools').Tool,
  'id' | 'title' | 'description' | 'status' | 'href' | 'iconName'
> & {
  color?: string;
};

export function useToolTracking(addToRecent: (item: QuickAccessItem) => void) {
  return useCallback(
    (tool: TrackableTool) => {
      if (!tool?.href) {
        logger.warn(`Tool ${tool?.id ?? 'unknown'} has no href and cannot be tracked`, 'useToolTracking');
        return false;
      }

      const quickAccessItem: QuickAccessItem = {
        id: tool.id,
        title: tool.title,
        description: tool.description,
        status: tool.status,
        href: tool.href,
        iconName: tool.iconName,
        color: tool.color,
      };

      try {
        addToRecent(quickAccessItem);
        return true;
      } catch (error) {
        logger.error('Failed to add tool to quick access', error, 'useToolTracking');
        return false;
      }
    },
    [addToRecent],
  );
}

