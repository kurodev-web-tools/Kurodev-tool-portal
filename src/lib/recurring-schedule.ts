// src/lib/recurring-schedule.ts
import { parseISO, addDays, addWeeks, addMonths, format } from 'date-fns';
import { ScheduleItem } from '@/types/schedule';

export interface RepeatRule {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: string;
  count?: number;
}

/**
 * 繰り返し予定を生成する
 * @param baseSchedule 基本となるスケジュール
 * @param repeatRule 繰り返しルール
 * @returns 生成されたスケジュールの配列
 */
export function generateRecurringSchedules(
  baseSchedule: ScheduleItem,
  repeatRule: RepeatRule
): ScheduleItem[] {
  const schedules: ScheduleItem[] = [];
  const baseDate = parseISO(baseSchedule.date);
  
  // グループIDを生成（親スケジュールのIDを基準に）
  const groupId = `recurring-${Date.now()}`;
  
  let currentDate = baseDate;
  let count = 0;
  const maxCount = repeatRule.count || 100; // デフォルトは100件まで

  while (count < maxCount) {
    // 終了日チェック
    if (repeatRule.endDate) {
      const endDate = parseISO(repeatRule.endDate);
      if (currentDate > endDate) {
        break;
      }
    }

    // 各予定を完全に独立した予定として作成
    const schedule: ScheduleItem = {
      ...baseSchedule,
      id: `${groupId}-${count}`, // グループIDとカウントで一意IDを生成
      date: format(currentDate, 'yyyy-MM-dd'),
      recurringInfo: {
        groupId: groupId,
        pattern: repeatRule.type,
      },
    };

    schedules.push(schedule);
    count++;

    // 次の日付を計算
    switch (repeatRule.type) {
      case 'daily':
        currentDate = addDays(currentDate, repeatRule.interval);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, repeatRule.interval);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, repeatRule.interval);
        break;
    }
  }

  return schedules;
}

/**
 * 特定の繰り返しグループに属するスケジュールを取得
 * @param groupId グループID
 * @param allSchedules 全スケジュール
 * @returns 該当するスケジュールの配列
 */
export function getSchedulesByGroupId(
  groupId: string,
  allSchedules: ScheduleItem[]
): ScheduleItem[] {
  return allSchedules.filter(s => s.recurringInfo?.groupId === groupId);
}

/**
 * 繰り返しグループを一括削除
 * @param groupId グループID
 * @param allSchedules 全スケジュール
 * @returns グループを除外したスケジュールの配列
 */
export function deleteRecurringGroup(
  groupId: string,
  allSchedules: ScheduleItem[]
): ScheduleItem[] {
  return allSchedules.filter(s => s.recurringInfo?.groupId !== groupId);
}
