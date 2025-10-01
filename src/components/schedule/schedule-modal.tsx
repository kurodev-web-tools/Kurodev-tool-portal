
'use client';

import { useSchedule } from '@/contexts/ScheduleContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScheduleForm } from './schedule-form';

export function ScheduleModal() {
  const { isModalOpen, setIsModalOpen, editingSchedule, setEditingSchedule } = useSchedule();

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingSchedule(null); // モーダルが閉じられたら編集状態をリセット
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            {editingSchedule ? 'スケジュールを編集' : '新規スケジュール登録'}
          </DialogTitle>
        </DialogHeader>
        <ScheduleForm />
      </DialogContent>
    </Dialog>
  );
}
