// src/lib/schedule-storage.ts
import { v4 as uuidv4 } from 'uuid';
import { ScheduleItem } from '@/types/schedule';

const STORAGE_KEY = 'vtuber-schedule-calendar-items';

// スケジュールアイテムをlocalStorageから読み込む
export function loadSchedules(): ScheduleItem[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Failed to load schedules from localStorage", error);
    return [];
  }
}

// スケジュールアイテムをlocalStorageに保存する
export function saveSchedules(schedules: ScheduleItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error("Failed to save schedules to localStorage", error);
  }
}

// 新しいスケジュールアイテムを追加する
export function addSchedule(newItem: Omit<ScheduleItem, 'id' | 'isCompleted'>): ScheduleItem {
  const schedules = loadSchedules();
  const newSchedule: ScheduleItem = {
    ...newItem,
    id: uuidv4(),
    isCompleted: false,
  };
  schedules.push(newSchedule);
  saveSchedules(schedules);
  return newSchedule;
}

// スケジュールアイテムを更新する
export function updateSchedule(updatedItem: ScheduleItem): void {
  const schedules = loadSchedules();
  const index = schedules.findIndex(item => item.id === updatedItem.id);
  if (index !== -1) {
    schedules[index] = updatedItem;
    saveSchedules(schedules);
  }
}

// スケジュールアイテムを削除する
export function deleteSchedule(id: string): void {
  const schedules = loadSchedules();
  const filteredSchedules = schedules.filter(item => item.id !== id);
  saveSchedules(filteredSchedules);
}
