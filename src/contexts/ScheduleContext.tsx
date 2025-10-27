'use client';

import { createContext, useContext, useState, Dispatch, SetStateAction, ReactNode, useEffect } from 'react';
import { ScheduleItem } from '@/types/schedule';
import { loadSchedules, updateSchedule as updateScheduleStorage } from '@/lib/schedule-storage';
import { toast } from 'sonner';

interface ScheduleContextType {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedDate: Date | undefined;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>;
  schedules: ScheduleItem[];
  refreshSchedules: () => void;
  editingSchedule: ScheduleItem | null;
  setEditingSchedule: Dispatch<SetStateAction<ScheduleItem | null>>;
  updateScheduleDate: (scheduleId: string, newDate: string) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

  const refreshSchedules = () => {
    const loadedSchedules = loadSchedules();
    setSchedules(loadedSchedules);
  };

  // スケジュールの日付を更新する関数
  const updateScheduleDate = (scheduleId: string, newDate: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) {
      toast.error('予定が見つかりません');
      return;
    }

    const updatedSchedule: ScheduleItem = {
      ...schedule,
      date: newDate,
    };

    updateScheduleStorage(updatedSchedule);
    refreshSchedules();
    toast.success('予定を移動しました');
  };

  useEffect(() => {
    refreshSchedules();
  }, []);

  return (
    <ScheduleContext.Provider value={{ 
      isModalOpen, 
      setIsModalOpen, 
      selectedDate, 
      setSelectedDate, 
      schedules, 
      refreshSchedules, 
      editingSchedule, 
      setEditingSchedule,
      updateScheduleDate
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}