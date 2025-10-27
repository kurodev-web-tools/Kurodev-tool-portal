'use client';

import React, { useState } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { ScheduleItem } from '@/types/schedule';
import { deleteSchedule } from '@/lib/schedule-storage';
import { format, isSameDay, isFuture, isPast, startOfToday, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Search, X } from 'lucide-react';
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

export function ScheduleList() {
  const { schedules, selectedDate, setIsModalOpen, setEditingSchedule, refreshSchedules } = useSchedule();
  const [scheduleIdToDelete, setScheduleIdToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  // 選択日の予定（検索フィルター適用）
  const selectedDaySchedules = selectedDate
    ? schedules.filter(s => 
        isSameDay(parseISO(s.date), selectedDate) && matchesSearch(s, searchQuery)
      )
    : [];

  // 全予定を日付順でソート（近い日付から降順）
  const allSchedules = schedules
    .filter(s => matchesSearch(s, searchQuery))
    .sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      const todayTime = today.getTime();
      
      // 今日からの距離でソート（近い日付から降順）
      const distanceA = Math.abs(dateA.getTime() - todayTime);
      const distanceB = Math.abs(dateB.getTime() - todayTime);
      
      return distanceA - distanceB;
    });

  const renderScheduleItem = (schedule: ScheduleItem) => (
    <div key={schedule.id} className="border p-2 rounded-md text-sm hover:bg-accent/50 transition-colors">
      <p className="font-bold truncate">{schedule.title || '(タイトルなし)'}</p>
      <p className="text-xs">{format(parseISO(schedule.date), 'M月d日 (E)', { locale: ja })} {schedule.time}</p>
      <p className="text-xs text-muted-foreground truncate">{schedule.category} / {schedule.platform}</p>
      <div className="flex justify-end mt-2 space-x-1">
        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleEdit(schedule)}>
          <Edit className="h-3 w-3" />
        </Button>
        <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => setScheduleIdToDelete(schedule.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6 mt-6">
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
          <h3 className="font-semibold mb-2 text-sm">
            {selectedDate ? format(selectedDate, 'M月d日 (E)', { locale: ja }) : '日付を選択'} の予定
          </h3>
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
          <h3 className="font-semibold mb-2 text-sm">スケジュール一覧</h3>
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
