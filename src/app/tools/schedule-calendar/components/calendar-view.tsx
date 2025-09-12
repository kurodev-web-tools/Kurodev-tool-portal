'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScheduleItem, loadSchedules } from '@/app/tools/schedule-calendar/utils/schedule-storage';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval as eachDayOfMonthInterval, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns'; // addMonths, subMonths を追加
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type ViewMode = 'month' | 'week' | 'day';

export function CalendarView() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const loadedSchedules = loadSchedules();
    setSchedules(loadedSchedules);
  }, []);

  const scheduledDays = schedules.map(s => new Date(s.date));

  const modifiers = {
    scheduled: scheduledDays,
  };

  const modifiersStyles = {
    scheduled: {
      fontWeight: 'bold',
      color: 'blue',
    },
  };

  const weekDays = selectedDate
    ? eachDayOfInterval({
        start: startOfWeek(selectedDate, { weekStartsOn: 0 }),
        end: endOfWeek(selectedDate, { weekStartsOn: 0 }),
      })
    : [];

  const monthDays = selectedDate
    ? eachDayOfMonthInterval({
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate),
      })
    : [];

  // 週の移動関数
  const goToPreviousWeek = () => {
    setSelectedDate((prevDate) => (prevDate ? subWeeks(prevDate, 1) : undefined));
  };

  const goToNextWeek = () => {
    setSelectedDate((prevDate) => (prevDate ? addWeeks(prevDate, 1) : undefined));
  };

  // 月の移動関数
  const goToPreviousMonth = () => {
    setSelectedDate((prevDate) => (prevDate ? subMonths(prevDate, 1) : undefined));
  };

  const goToNextMonth = () => {
    setSelectedDate((prevDate) => (prevDate ? addMonths(prevDate, 1) : undefined));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-2 space-x-2">
        <Button
          variant={viewMode === 'month' ? 'default' : 'outline'}
          onClick={() => setViewMode('month')}
        >
          月
        </Button>
        <Button
          variant={viewMode === 'week' ? 'default' : 'outline'}
          onClick={() => setViewMode('week')}
        >
          週
        </Button>
        <Button
          variant={viewMode === 'day' ? 'default' : 'outline'}
          onClick={() => setViewMode('day')}
        >
          日
        </Button>
      </div>
      <div className="flex-grow p-4 rounded-md"> {/* borderを削除 */}
        {viewMode === 'month' && (
          <div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              locale={ja}
              className="rounded-md border w-full"
            />
          </div>
        )}
        {viewMode === 'week' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" onClick={goToPreviousWeek}>←</Button>
              <h3 className="font-bold">
                {selectedDate ? format(startOfWeek(selectedDate, { weekStartsOn: 0 }), "M月", { locale: ja }) : ''}
                第{selectedDate ? Math.ceil(Number(format(selectedDate, "d", { locale: ja })) / 7) : ''}週
              </h3>
              <Button variant="outline" onClick={goToNextWeek}>→</Button>
            </div>
            <div className="flex flex-col gap-2">
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="border p-2 rounded-md h-[9rem]">
                  <div className="flex items-baseline mb-2">
                    <h3 className="font-bold mr-2">{format(day, "M/d (E)", { locale: ja })}</h3>
                    {schedules.filter(s => isSameDay(new Date(s.date), day)).length > 0 ? (
                      <ul className="flex flex-wrap gap-x-2">
                        {schedules.filter(s => isSameDay(new Date(s.date), day)).map((schedule) => (
                          <li key={schedule.id} className="text-sm">
                            {schedule.time} - {schedule.title} ({schedule.platform})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">予定なし</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {viewMode === 'day' && (
          <div>
            <h2>日表示カレンダー</h2>
            {selectedDate && (
              <div className="mt-4">
                <h3>{format(selectedDate, "yyyy年MM月dd日", { locale: ja })} のスケジュール</h3>
                {schedules.filter(s => s.date === format(selectedDate, "yyyy-MM-dd")).length > 0 ? (
                  <ul>
                    {schedules.filter(s => s.date === format(selectedDate, "yyyy-MM-dd")).map((schedule) => (
                      <li key={schedule.id} className="mb-2 p-2 border rounded-md">
                        <p><strong>タイトル:</strong> {schedule.title}</p>
                        <p><strong>時間:</strong> {schedule.time}</p>
                        <p><strong>カテゴリ:</strong> {schedule.category}</p>
                        <p><strong>プラットフォーム:</strong> {schedule.platform}</p>
                        <p><strong>備考:</strong> {schedule.notes}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>この日のスケジュールはありません。</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}