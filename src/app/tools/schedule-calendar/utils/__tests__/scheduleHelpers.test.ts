import {
  getScheduleDuration,
  getScheduleTimeSlots,
  getScheduleForTimeSlot,
  getScheduleForHalfHourSlot
} from '../scheduleHelpers';
import { ScheduleItem } from '@/types/schedule';

describe('scheduleHelpers', () => {
  describe('getScheduleDuration', () => {
    it('スケジュールのdurationを返す', () => {
      const schedule: ScheduleItem = {
        id: '1',
        date: '2025-10-10',
        time: '10:00',
        duration: 120,
        title: 'テスト配信',
        category: '雑談',
        platform: 'YouTube'
      };
      
      expect(getScheduleDuration(schedule)).toBe(120);
    });

    it('durationが未設定の場合はデフォルト60分を返す', () => {
      const schedule: ScheduleItem = {
        id: '1',
        date: '2025-10-10',
        time: '10:00',
        title: 'テスト配信',
        category: '雑談',
        platform: 'YouTube'
      };
      
      expect(getScheduleDuration(schedule)).toBe(60);
    });
  });

  describe('getScheduleTimeSlots', () => {
    it('30分刻みの時間スロットを生成する', () => {
      const schedule: ScheduleItem = {
        id: '1',
        date: '2025-10-10',
        time: '10:00',
        duration: 90, // 1時間30分
        title: 'テスト配信',
        category: '雑談',
        platform: 'YouTube'
      };
      
      const slots = getScheduleTimeSlots(schedule);
      
      expect(slots).toHaveLength(3); // 90分 = 3スロット（30分×3）
      expect(slots[0]).toEqual({ hour: 10, minute: 0 });
      expect(slots[1]).toEqual({ hour: 10, minute: 30 });
      expect(slots[2]).toEqual({ hour: 11, minute: 0 });
    });

    it('時間が設定されていない場合は空配列を返す', () => {
      const schedule: ScheduleItem = {
        id: '1',
        date: '2025-10-10',
        title: 'テスト配信',
        category: '雑談',
        platform: 'YouTube'
      };
      
      const slots = getScheduleTimeSlots(schedule);
      expect(slots).toEqual([]);
    });

    it('2時間の配信は4スロット生成される', () => {
      const schedule: ScheduleItem = {
        id: '1',
        date: '2025-10-10',
        time: '20:00',
        duration: 120,
        title: '長時間配信',
        category: 'ゲーム',
        platform: 'YouTube'
      };
      
      const slots = getScheduleTimeSlots(schedule);
      
      expect(slots).toHaveLength(4); // 120分 = 4スロット
      expect(slots[0]).toEqual({ hour: 20, minute: 0 });
      expect(slots[1]).toEqual({ hour: 20, minute: 30 });
      expect(slots[2]).toEqual({ hour: 21, minute: 0 });
      expect(slots[3]).toEqual({ hour: 21, minute: 30 });
    });
  });

  describe('getScheduleForTimeSlot', () => {
    const schedules: ScheduleItem[] = [
      {
        id: '1',
        date: '2025-10-10',
        time: '10:00',
        duration: 60,
        title: '午前配信',
        category: '雑談',
        platform: 'YouTube'
      },
      {
        id: '2',
        date: '2025-10-10',
        time: '20:00',
        duration: 120,
        title: '夜配信',
        category: 'ゲーム',
        platform: 'Twitch'
      },
      {
        id: '3',
        date: '2025-10-11',
        time: '15:00',
        duration: 60,
        title: '翌日配信',
        category: '雑談',
        platform: 'YouTube'
      }
    ];

    it('指定した時間のスケジュールを見つける', () => {
      const day = new Date('2025-10-10');
      const schedule = getScheduleForTimeSlot(schedules, day, 10);
      
      expect(schedule).toBeDefined();
      expect(schedule?.id).toBe('1');
      expect(schedule?.title).toBe('午前配信');
    });

    it('長時間配信の途中の時間でも見つけられる', () => {
      const day = new Date('2025-10-10');
      const schedule = getScheduleForTimeSlot(schedules, day, 21);
      
      expect(schedule).toBeDefined();
      expect(schedule?.id).toBe('2');
      expect(schedule?.title).toBe('夜配信');
    });

    it('該当するスケジュールがない場合はundefinedを返す', () => {
      const day = new Date('2025-10-10');
      const schedule = getScheduleForTimeSlot(schedules, day, 15);
      
      expect(schedule).toBeUndefined();
    });

    it('日付が異なる場合は見つからない', () => {
      const day = new Date('2025-10-11');
      const schedule = getScheduleForTimeSlot(schedules, day, 10);
      
      expect(schedule).toBeUndefined();
    });
  });

  describe('getScheduleForHalfHourSlot', () => {
    const schedules: ScheduleItem[] = [
      {
        id: '1',
        date: '2025-10-10',
        time: '10:30',
        duration: 60,
        title: '10:30開始配信',
        category: '雑談',
        platform: 'YouTube'
      }
    ];

    it('30分刻みで正確にマッチする', () => {
      const day = new Date('2025-10-10');
      const schedule = getScheduleForHalfHourSlot(schedules, day, 10, 30);
      
      expect(schedule).toBeDefined();
      expect(schedule?.id).toBe('1');
    });

    it('マッチしない30分刻みではundefinedを返す', () => {
      const day = new Date('2025-10-10');
      const schedule = getScheduleForHalfHourSlot(schedules, day, 10, 0);
      
      expect(schedule).toBeUndefined();
    });

    it('配信の終了時間内でもマッチする', () => {
      const day = new Date('2025-10-10');
      const schedule = getScheduleForHalfHourSlot(schedules, day, 11, 0);
      
      expect(schedule).toBeDefined();
      expect(schedule?.id).toBe('1');
    });
  });
});


