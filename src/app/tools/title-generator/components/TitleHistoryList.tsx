import { memo, useMemo } from 'react';
import { History, Trash2, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { GenerationHistoryEntry } from '@/types/title-generator';

export interface TitleHistoryListProps {
  items: GenerationHistoryEntry[];
  onSelect: (item: GenerationHistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  isHydrated?: boolean;
}

const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;

  return new Date(timestamp).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TitleHistoryList = memo(function TitleHistoryList({
  items,
  onSelect,
  onDelete,
  onClear,
  isHydrated = true,
}: TitleHistoryListProps) {
  const hasItems = isHydrated && items.length > 0;

  const historyCards = useMemo(
    () =>
      items.map((item) => (
        <Card
          key={item.id}
          className={cn(
            'cursor-pointer hover:border-[#20B2AA] transition-all group relative overflow-visible',
          )}
          onClick={() => onSelect(item)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-[#20B2AA] transition-colors rounded-l-xl -ml-2" />
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {item.titles.length > 0 && (
                  <p className="text-sm font-medium truncate mb-1">{item.titles[0].text}</p>
                )}

                {item.inputData.videoTheme && (
                  <p className="text-xs text-muted-foreground truncate mb-1">
                    {item.inputData.videoTheme.substring(0, 50)}
                    {item.inputData.videoTheme.length > 50 ? '...' : ''}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(item.timestamp)}</span>
                  <span className="text-[#808080]">・</span>
                  <span>{item.titles.length}件のタイトル案</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(item.id);
                }}
                aria-label="履歴を削除"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )),
    [items, onDelete, onSelect],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>生成履歴</span>
          {hasItems && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-red-400 hover:text-red-300"
              aria-label="すべての履歴を削除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isHydrated ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            <p>履歴を読み込んでいます...</p>
          </div>
        ) : !hasItems ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>生成履歴がありません</p>
            <p className="text-xs mt-2">タイトルと概要欄を生成すると、ここに履歴が表示されます</p>
          </div>
        ) : (
          <div className="space-y-2 md:max-h-[calc(100vh-300px)] md:overflow-y-auto">{historyCards}</div>
        )}
      </CardContent>
    </Card>
  );
});
