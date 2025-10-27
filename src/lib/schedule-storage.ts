// src/lib/schedule-storage.ts
import { v4 as uuidv4 } from 'uuid';
import { ScheduleItem } from '@/types/schedule';
import { logger } from './logger';

const STORAGE_KEY = 'vtuber-schedule-calendar-items';

// スケジュールアイテムをlocalStorageから読み込む
export function loadSchedules(): ScheduleItem[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    logger.error('スケジュール読み込み失敗', error, 'scheduleStorage');
    return [];
  }
}

// スケジュールアイテムをlocalStorageに保存する
export function saveSchedules(schedules: ScheduleItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    logger.error('スケジュール保存失敗', error, 'scheduleStorage');
  }
}

// 新しいスケジュールアイテムを追加する
export function addSchedule(newItem: Omit<ScheduleItem, 'id' | 'isCompleted' | 'isArchived'>): ScheduleItem {
  const schedules = loadSchedules();
  const newSchedule: ScheduleItem = {
    ...newItem,
    id: uuidv4(),
    isCompleted: false,
    isArchived: false,
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

// スケジュールをアーカイブする
export function archiveSchedule(id: string): void {
  const schedules = loadSchedules();
  const index = schedules.findIndex(item => item.id === id);
  if (index !== -1) {
    schedules[index] = {
      ...schedules[index],
      isArchived: true,
      archivedAt: new Date().toISOString(),
    };
    saveSchedules(schedules);
  }
}

// スケジュールをアーカイブから復元する
export function unarchiveSchedule(id: string): void {
  const schedules = loadSchedules();
  const index = schedules.findIndex(item => item.id === id);
  if (index !== -1) {
    schedules[index] = {
      ...schedules[index],
      isArchived: false,
      archivedAt: undefined,
    };
    saveSchedules(schedules);
  }
}

// 複数のスケジュールをアーカイブする
export function archiveSchedules(ids: string[]): void {
  const schedules = loadSchedules();
  ids.forEach(id => {
    const index = schedules.findIndex(item => item.id === id);
    if (index !== -1) {
      schedules[index] = {
        ...schedules[index],
        isArchived: true,
        archivedAt: new Date().toISOString(),
      };
    }
  });
  saveSchedules(schedules);
}

// 複数のスケジュールをアーカイブから復元する
export function unarchiveSchedules(ids: string[]): void {
  const schedules = loadSchedules();
  ids.forEach(id => {
    const index = schedules.findIndex(item => item.id === id);
    if (index !== -1) {
      schedules[index] = {
        ...schedules[index],
        isArchived: false,
        archivedAt: undefined,
      };
    }
  });
  saveSchedules(schedules);
}
