// src/app/tools/schedule-calendar/utils/schedule-storage.ts

export interface ScheduleItem {
  id: string; // UUID
  title: string; // 予定のタイトル
  date: string; // ISO 8601形式 (YYYY-MM-DD)
  time?: string; // HH:mm形式 または「未定」
  category: string; // 「雑談」「ゲーム」など
  platform: string; // 「YouTube」「Twitch」など
  notes?: string; // 備考
  isCompleted: boolean; // 完了フラグ
}

const STORAGE_KEY = 'vtuber-schedule-calendar-data';

export function loadSchedules(): ScheduleItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData === null) {
      return [];
    }
    return JSON.parse(serializedData) as ScheduleItem[];
  } catch (error) {
    console.error("Failed to load schedules from localStorage", error);
    return [];
  }
}

export function saveSchedules(schedules: ScheduleItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const serializedData = JSON.stringify(schedules);
    localStorage.setItem(STORAGE_KEY, serializedData);
  } catch (error) {
    console.error("Failed to save schedules to localStorage", error);
  }
}
