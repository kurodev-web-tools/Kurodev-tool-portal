'use client';

import React, { useState } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { ScheduleItem, deleteSchedule } from '@/lib/schedule-storage';
import { format, isSameDay, isFuture, isPast, startOfToday, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
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

export function ScheduleList() {
  const { schedules, selectedDate, setIsModalOpen, setEditingSchedule, refreshSchedules } = useSchedule();
  const [scheduleIdToDelete, setScheduleIdToDelete] = useState<string | null>(null);
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
        console.error("Failed to delete schedule", error);
        toast.error('スケジュールの削除に失敗しました。');
      }
      setScheduleIdToDelete(null);
    }
  };

  // 選択日の予定
  const selectedDaySchedules = selectedDate
    ? schedules.filter(s => isSameDay(parseISO(s.date), selectedDate))
    : [];

  // 未来の予定（今日以降）
  const futureSchedules = schedules
    .filter(s => isFuture(parseISO(s.date)) || isSameDay(parseISO(s.date), today))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  // 過去の予定
  const pastSchedules = schedules
    .filter(s => isPast(parseISO(s.date)) && !isSameDay(parseISO(s.date), today))
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const renderScheduleItem = (schedule: ScheduleItem) => (
    <div key={schedule.id} className="border p-2 rounded-md text-sm">
      <p className="font-bold">{schedule.title || '(タイトルなし)'}</p>
      <p>{format(parseISO(schedule.date), 'M月d日 (E)', { locale: ja })} {schedule.time}</p>
      <p className="text-xs text-gray-500">{schedule.category} / {schedule.platform}</p>
      <div className="flex justify-end mt-2 space-x-2">
        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleEdit(schedule)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => setScheduleIdToDelete(schedule.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6 mt-6">
        {/* 選択日の予定 */}
        <div>
          <h3 className="font-semibold mb-2">
            {selectedDate ? format(selectedDate, 'M月d日 (E)', { locale: ja }) : '日付を選択'} の予定
          </h3>
          <div className="space-y-2">
            {selectedDaySchedules.length > 0 ? (
              selectedDaySchedules.map(renderScheduleItem)
            ) : (
              <p className="text-sm text-gray-500">予定はありません。</p>
            )}
          </div>
        </div>

        {/* これからの予定 */}
        <div>
          <h3 className="font-semibold mb-2">これからの予定</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {futureSchedules.length > 0 ? (
              futureSchedules.map(renderScheduleItem)
            ) : (
              <p className="text-sm text-gray-500">予定はありません。</p>
            )}
          </div>
        </div>

        {/* 過去の予定 */}
        <div>
          <h3 className="font-semibold mb-2">過去の予定</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {pastSchedules.length > 0 ? (
              pastSchedules.map(renderScheduleItem)
            ) : (
              <p className="text-sm text-gray-500">表示できる過去の予定はありません。</p>
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
