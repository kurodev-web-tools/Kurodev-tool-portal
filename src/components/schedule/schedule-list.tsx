'use client';

import React, { useState } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { ScheduleItem } from '@/types/schedule';
import { deleteSchedule, updateSchedule, loadSchedules, saveSchedules, archiveSchedule, unarchiveSchedule, archiveSchedules, unarchiveSchedules } from '@/lib/schedule-storage';
import { format, isSameDay, isFuture, isPast, startOfToday, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Search, X, CheckSquare, Square, Archive } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/app/tools/schedule-calendar/components/settings-tab';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getCategoryBackgroundColor, getCategoryBorderColor } from '@/lib/category-colors';

export function ScheduleList() {
  const { schedules, selectedDate, setIsModalOpen, setEditingSchedule, refreshSchedules } = useSchedule();
  const { settings } = useSettings();
  const [scheduleIdToDelete, setScheduleIdToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<Set<string>>(new Set());
  const [filterTab, setFilterTab] = useState<'active' | 'completed' | 'archived' | 'all'>('active');
  const today = startOfToday();

  const handleEdit = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (scheduleIdToDelete) {
      try {
        deleteSchedule(scheduleIdToDelete);
        toast.success('スケジュールを削除しました。');
        refreshSchedules();
      } catch (error) {
        logger.error('スケジュール削除失敗', error, 'ScheduleList');
        toast.error('スケジュールの削除に失敗しました。');
      }
      setScheduleIdToDelete(null);
    }
  };

  // 一括操作用の関数
  const toggleSelection = (scheduleId: string) => {
    const newSelected = new Set(selectedScheduleIds);
    if (newSelected.has(scheduleId)) {
      newSelected.delete(scheduleId);
    } else {
      newSelected.add(scheduleId);
    }
    setSelectedScheduleIds(newSelected);
  };

  const selectAll = (schedulesToSelect: ScheduleItem[]) => {
    const allIds = schedulesToSelect.map(s => s.id);
    setSelectedScheduleIds(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedScheduleIds(new Set());
  };

  const selectByCategory = (category: string) => {
    const categoryIds = currentSchedules
      .filter(s => s.category === category)
      .map(s => s.id);
    setSelectedScheduleIds(new Set(categoryIds));
  };

  const handleBulkDelete = () => {
    const confirmed = window.confirm(`${selectedScheduleIds.size}件の予定を削除しますか？`);
    if (confirmed) {
      selectedScheduleIds.forEach(id => deleteSchedule(id));
      toast.success(`${selectedScheduleIds.size}件の予定を削除しました`);
      setSelectedScheduleIds(new Set());
      refreshSchedules();
    }
  };

  const handleBulkCategoryChange = (newCategory: string) => {
    selectedScheduleIds.forEach(id => {
      const schedule = schedules.find(s => s.id === id);
      if (schedule) {
        updateSchedule({ ...schedule, category: newCategory });
      }
    });
    toast.success(`${selectedScheduleIds.size}件の予定のカテゴリを変更しました`);
    setSelectedScheduleIds(new Set());
    refreshSchedules();
  };

  const handleBulkPlatformChange = (newPlatform: string) => {
    selectedScheduleIds.forEach(id => {
      const schedule = schedules.find(s => s.id === id);
      if (schedule) {
        updateSchedule({ ...schedule, platform: newPlatform });
      }
    });
    toast.success(`${selectedScheduleIds.size}件の予定のプラットフォームを変更しました`);
    setSelectedScheduleIds(new Set());
    refreshSchedules();
  };

  // アーカイブ関連の関数
  const handleArchive = (schedule: ScheduleItem) => {
    try {
      archiveSchedule(schedule.id);
      toast.success('予定をアーカイブしました。');
      refreshSchedules();
    } catch (error) {
      logger.error('アーカイブ失敗', error, 'ScheduleList');
      toast.error('アーカイブに失敗しました。');
    }
  };

  const handleUnarchive = (schedule: ScheduleItem) => {
    try {
      unarchiveSchedule(schedule.id);
      toast.success('予定を復元しました。');
      refreshSchedules();
    } catch (error) {
      logger.error('復元失敗', error, 'ScheduleList');
      toast.error('復元に失敗しました。');
    }
  };

  const handleBulkArchive = () => {
    const confirmed = window.confirm(`${selectedScheduleIds.size}件の予定をアーカイブしますか？`);
    if (confirmed) {
      archiveSchedules(Array.from(selectedScheduleIds));
      toast.success(`${selectedScheduleIds.size}件の予定をアーカイブしました`);
      setSelectedScheduleIds(new Set());
      refreshSchedules();
    }
  };

  const handleBulkUnarchive = () => {
    const confirmed = window.confirm(`${selectedScheduleIds.size}件の予定を復元しますか？`);
    if (confirmed) {
      unarchiveSchedules(Array.from(selectedScheduleIds));
      toast.success(`${selectedScheduleIds.size}件の予定を復元しました`);
      setSelectedScheduleIds(new Set());
      refreshSchedules();
    }
  };

  // 検索フィルター関数
  const matchesSearch = (schedule: ScheduleItem, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    return (
      (schedule.title || '').toLowerCase().includes(lowerQuery) ||
      (schedule.notes || '').toLowerCase().includes(lowerQuery) ||
      (schedule.category || '').toLowerCase().includes(lowerQuery) ||
      (schedule.platform || '').toLowerCase().includes(lowerQuery) ||
      (schedule.time || '').toLowerCase().includes(lowerQuery)
    );
  };

  // フィルター関数
  const matchesFilter = (schedule: ScheduleItem): boolean => {
    switch (filterTab) {
      case 'active':
        return !schedule.isCompleted && !schedule.isArchived;
      case 'completed':
        return schedule.isCompleted && !schedule.isArchived;
      case 'archived':
        return schedule.isArchived;
      case 'all':
        return true;
      default:
        return true;
    }
  };

  // 統計計算
  const activeSchedules = schedules.filter(s => !s.isCompleted && !s.isArchived);
  const completedSchedules = schedules.filter(s => s.isCompleted && !s.isArchived);
  const archivedSchedules = schedules.filter(s => s.isArchived);

  // 選択日の予定（検索フィルター適用）
  const selectedDaySchedules = selectedDate
    ? schedules.filter(s => 
        isSameDay(parseISO(s.date), selectedDate) && matchesSearch(s, searchQuery) && matchesFilter(s)
      )
    : [];

  // 全予定を日付順でソート（近い日付から降順）
  const allSchedules = schedules
    .filter(s => matchesSearch(s, searchQuery) && matchesFilter(s))
    .sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      const todayTime = today.getTime();
      
      // 今日からの距離でソート（近い日付から降順）
      const distanceA = Math.abs(dateA.getTime() - todayTime);
      const distanceB = Math.abs(dateB.getTime() - todayTime);
      
      return distanceA - distanceB;
    });

  // 現在表示中のスケジュール（選択日または全予定）
  const currentSchedules = selectedDate ? selectedDaySchedules : allSchedules;

  const renderScheduleItem = (schedule: ScheduleItem) => (
    <div 
      key={schedule.id} 
      className={`flex items-start gap-2 border p-2 rounded-md text-sm transition-colors ${
        isSelectionMode && selectedScheduleIds.has(schedule.id)
          ? 'bg-[#20B2AA]/20 border-[#20B2AA]'
          : schedule.isArchived
          ? 'opacity-50 grayscale'
          : ''
      }`}
      style={{
        borderColor: isSelectionMode && selectedScheduleIds.has(schedule.id)
          ? '#20B2AA'
          : getCategoryBorderColor(schedule.category, 0.5),
      }}
    >
      {isSelectionMode && (
        <Checkbox
          checked={selectedScheduleIds.has(schedule.id)}
          onCheckedChange={() => toggleSelection(schedule.id)}
          className="mt-0.5"
        />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-bold truncate">{schedule.title || '(タイトルなし)'}</p>
          {schedule.checklist && schedule.checklist.length > 0 && (
            <Badge variant="secondary" className="h-5 px-2 text-xs">
              {schedule.checklist.filter(item => item.checked).length}/{schedule.checklist.length}
            </Badge>
          )}
        </div>
        <p className="text-xs">{format(parseISO(schedule.date), 'M月d日 (E)', { locale: ja })} {schedule.time}</p>
        <p className="text-xs text-muted-foreground truncate">{schedule.category} / {schedule.platform}</p>
        {schedule.isArchived && schedule.archivedAt && (
          <p className="text-xs text-muted-foreground mt-1">アーカイブ日: {format(parseISO(schedule.archivedAt), 'yyyy/MM/dd', { locale: ja })}</p>
        )}
      </div>
      {!isSelectionMode && (
        <div className="flex justify-end mt-2 space-x-1">
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleEdit(schedule)}>
            <Edit className="h-3 w-3" />
          </Button>
          {schedule.isArchived ? (
            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUnarchive(schedule)} title="復元">
              <Archive className="h-3 w-3" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleArchive(schedule)} title="アーカイブ">
              <Archive className="h-3 w-3" />
            </Button>
          )}
          <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => setScheduleIdToDelete(schedule.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-6 mt-6">
        {/* フィルタータブ */}
        <Tabs value={filterTab} onValueChange={(value: any) => setFilterTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active" className="relative">
              アクティブ
              {activeSchedules.length > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeSchedules.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              完了済み
              {completedSchedules.length > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {completedSchedules.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived">
              アーカイブ
              {archivedSchedules.length > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {archivedSchedules.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">すべて</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 検索バー */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="予定を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 bg-[#2D2D2D] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#A0A0A0]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-[#20B2AA] transition-colors"
              aria-label="検索をクリア"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 選択日の予定 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">
              {selectedDate ? format(selectedDate, 'M月d日 (E)', { locale: ja }) : '日付を選択'} の予定
            </h3>
            {!isSelectionMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectionMode(true)}
                className="h-7 text-xs"
              >
                選択モード
              </Button>
            )}
          </div>
          
          {isSelectionMode && (
            <div className="mb-3 p-3 bg-[#2D2D2D] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedScheduleIds.size === selectedDaySchedules.length && selectedDaySchedules.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const allIds = selectedDaySchedules.map(s => s.id);
                        setSelectedScheduleIds(new Set(allIds));
                      } else {
                        clearSelection();
                      }
                    }}
                  />
                  <span className="text-xs font-medium">すべて選択</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSelectionMode(false);
                    clearSelection();
                  }}
                  className="h-7 text-xs"
                >
                  キャンセル
                </Button>
              </div>

              {selectedScheduleIds.size > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{selectedScheduleIds.size}件を選択中</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSelection}
                      className="h-7 text-xs"
                    >
                      クリア
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {settings.categories.slice(0, 5).map(cat => (
                      <Button
                        key={cat}
                        size="sm"
                        variant="outline"
                        onClick={() => selectByCategory(cat)}
                        className="text-xs h-7"
                      >
                        {cat}のみ
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Select onValueChange={handleBulkCategoryChange}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="カテゴリ変更" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select onValueChange={handleBulkPlatformChange}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="プラットフォーム変更" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.platforms.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="destructive"
                      onClick={handleBulkDelete}
                      className="col-span-1 sm:col-span-2 h-8 text-xs"
                    >
                      削除 ({selectedScheduleIds.size})
                    </Button>

                    {filterTab !== 'archived' && (
                      <Button
                        variant="outline"
                        onClick={handleBulkArchive}
                        className="col-span-1 sm:col-span-2 h-8 text-xs"
                      >
                        アーカイブ ({selectedScheduleIds.size})
                      </Button>
                    )}

                    {filterTab === 'archived' && (
                      <Button
                        variant="outline"
                        onClick={handleBulkUnarchive}
                        className="col-span-1 sm:col-span-2 h-8 text-xs"
                      >
                        復元 ({selectedScheduleIds.size})
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            {selectedDaySchedules.length > 0 ? (
              selectedDaySchedules.map(renderScheduleItem)
            ) : (
              <p className="text-xs text-muted-foreground">予定はありません。</p>
            )}
          </div>
        </div>

        {/* スケジュール一覧 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">スケジュール一覧</h3>
            {!isSelectionMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectionMode(true)}
                className="h-7 text-xs"
              >
                選択モード
              </Button>
            )}
          </div>

          {isSelectionMode && (
            <div className="mb-3 p-3 bg-[#2D2D2D] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedScheduleIds.size === allSchedules.length && allSchedules.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const allIds = allSchedules.map(s => s.id);
                        setSelectedScheduleIds(new Set(allIds));
                      } else {
                        clearSelection();
                      }
                    }}
                  />
                  <span className="text-xs font-medium">すべて選択</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSelectionMode(false);
                    clearSelection();
                  }}
                  className="h-7 text-xs"
                >
                  キャンセル
                </Button>
              </div>

              {selectedScheduleIds.size > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{selectedScheduleIds.size}件を選択中</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSelection}
                      className="h-7 text-xs"
                    >
                      クリア
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {settings.categories.slice(0, 5).map(cat => (
                      <Button
                        key={cat}
                        size="sm"
                        variant="outline"
                        onClick={() => selectByCategory(cat)}
                        className="text-xs h-7"
                      >
                        {cat}のみ
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Select onValueChange={handleBulkCategoryChange}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="カテゴリ変更" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select onValueChange={handleBulkPlatformChange}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="プラットフォーム変更" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.platforms.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="destructive"
                      onClick={handleBulkDelete}
                      className="col-span-1 sm:col-span-2 h-8 text-xs"
                    >
                      削除 ({selectedScheduleIds.size})
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-2 pb-6">
            {allSchedules.length > 0 ? (
              allSchedules.map(renderScheduleItem)
            ) : (
              <p className="text-xs text-muted-foreground">予定はありません。</p>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!scheduleIdToDelete} onOpenChange={(open) => !open && setScheduleIdToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は元に戻せません。スケジュールを完全に削除します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>いいえ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>はい</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
