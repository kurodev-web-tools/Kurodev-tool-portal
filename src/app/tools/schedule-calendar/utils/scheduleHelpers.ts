import { parseISO, isSameDay } from 'date-fns';
import { ScheduleItem } from '@/types/schedule';

/**
 * スケジュールの所要時間を取得（分単位）
 */
export function getScheduleDuration(schedule: ScheduleItem): number {
  return schedule.duration || 60; // デフォルト60分
}

/**
 * スケジュールの時間スロットを30分刻みで取得
 */
export function getScheduleTimeSlots(schedule: ScheduleItem) {
  const duration = getScheduleDuration(schedule);
  const timeSlots: Array<{ hour: number; minute: number }> = [];
  
  if (schedule.time) {
    const [hours, minutes] = schedule.time.split(':').map(Number);
    const startTime = hours * 60 + minutes; // 分単位に変換
    const endTime = startTime + duration;
    
    // 30分刻みで時間スロットを生成
    for (let time = startTime; time < endTime; time += 30) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      timeSlots.push({ hour, minute });
    }
  }
  
  return timeSlots;
}

/**
 * 指定した日時に該当するスケジュールを取得（時間単位）
 */
export function getScheduleForTimeSlot(
  schedules: ScheduleItem[],
  day: Date,
  hour: number
): ScheduleItem | undefined {
  return schedules.find(schedule => {
    if (!isSameDay(parseISO(schedule.date), day) || !schedule.time) return false;
    
    const timeSlots = getScheduleTimeSlots(schedule);
    return timeSlots.some(slot => slot.hour === hour);
  });
}

/**
 * 指定した日時に該当するスケジュールを取得（30分刻み）
 */
export function getScheduleForHalfHourSlot(
  schedules: ScheduleItem[],
  day: Date,
  hour: number,
  minute: number
): ScheduleItem | undefined {
  return schedules.find(schedule => {
    if (!isSameDay(parseISO(schedule.date), day) || !schedule.time) return false;
    
    const timeSlots = getScheduleTimeSlots(schedule);
    return timeSlots.some(slot => slot.hour === hour && slot.minute === minute);
  });
}


