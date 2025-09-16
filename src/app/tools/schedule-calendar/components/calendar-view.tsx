'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSchedule } from '@/contexts/ScheduleContext';
import { DayProps } from 'react-day-picker';
import { ScheduleItem } from '@/types/schedule';
import { useMediaQuery } from '@/hooks/use-media-query';

type ViewMode = 'month' | 'week' | 'day';

const ScheduleTooltipContent = ({ schedule }: { schedule: ScheduleItem }) => (
  <div className="p-2 text-sm">
    <p className="font-bold">{schedule.title || '(タイトルなし)'}</p>
    <p>{schedule.time}</p>
    <p className="text-xs text-muted-foreground">{schedule.category} / {schedule.platform}</p>
    {schedule.notes && <p className="mt-1 border-t pt-1 text-xs">{schedule.notes}</p>}
  </div>
);

export function CalendarView() {
  const { setIsModalOpen, selectedDate, setSelectedDate, schedules } = useSchedule();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    const savedViewMode = localStorage.getItem('calendarViewMode') as ViewMode;
    if (savedViewMode && ['month', 'week', 'day'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarViewMode', viewMode);
  }, [viewMode]);

  // --- ダブルクリック関連のロジック ---
  const [lastClickTime, setLastClickTime] = useState(0);
  const DOUBLE_CLICK_DELAY = 300;

  const handleDayDoubleClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };
  // --- ここまで ---

  const handleDaySelect = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
    } else {
      setSelectedDate(undefined);
    }
  };

  // --- PC用のクリックハンドラ（ダブルクリック判定付き） ---
  const handleDesktopDayClick = (day: Date) => {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < DOUBLE_CLICK_DELAY) {
      handleDayDoubleClick(day);
      setLastClickTime(0);
    } else {
      handleDaySelect(day);
    }
    setLastClickTime(currentTime);
  };

  // PC用: 予定が表示されるリッチな日付セル
  const RichCustomDay = (props: DayProps) => {
    const dateToUse = props.day.date;
    const daySchedules = schedules.filter(s => isSameDay(parseISO(s.date), dateToUse));
    const { className: originalClassName = "", ...restOfProps } = props;

    return (
      <td
        {...restOfProps}
        className={cn(
          originalClassName,
          "relative flex flex-col h-full p-1 !h-32",
          isSameDay(dateToUse, selectedDate || new Date()) && "bg-accent/50 dark:bg-accent"
        )}
        onClick={() => handleDesktopDayClick(dateToUse)}
      >
        <div className="relative flex flex-col h-full justify-between z-10">
          <div className="text-sm font-bold flex-shrink-0">
            {format(dateToUse, 'd')}
          </div>
          <div className="flex-grow space-y-0.5 overflow-hidden">
            {daySchedules.slice(0, 3).map(schedule => (
              <Tooltip key={schedule.id} delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className="truncate text-[10px] leading-tight bg-secondary rounded-sm px-0.5 cursor-default">
                    {schedule.time} {schedule.category}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <ScheduleTooltipContent schedule={schedule} />
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </td>
    );
  };

  // モバイル用: 日付の数字とドットだけのシンプルなセル
  const SimpleCustomDay = (props: DayProps) => {
    const dateToUse = props.day.date;
    const daySchedules = schedules.filter(s => isSameDay(parseISO(s.date), dateToUse));
    const { className: originalClassName = "", ...restOfProps } = props;

    return (
      <td
        {...restOfProps}
        className={cn(
          originalClassName,
          isSameDay(dateToUse, selectedDate || new Date()) && "bg-accent/50 dark:bg-accent"
        )}
        onClick={() => handleDaySelect(dateToUse)}
      >
        <div className="relative h-full flex flex-col items-center justify-center">
          <span>{format(dateToUse, 'd')}</span>
          {daySchedules.length > 0 && (
            <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
          )}
        </div>
      </td>
    );
  };

  const DayComponent = isDesktop ? RichCustomDay : SimpleCustomDay;

  const weekDays = selectedDate
    ? eachDayOfInterval({ start: startOfWeek(selectedDate, { weekStartsOn: 0 }), end: endOfWeek(selectedDate, { weekStartsOn: 0 }) })
    : [];

  const goToPreviousWeek = () => setSelectedDate((prev) => (prev ? subWeeks(prev, 1) : undefined));
  const goToNextWeek = () => setSelectedDate((prev) => (prev ? addWeeks(prev, 1) : undefined));

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <div className="flex justify-end p-2 space-x-2 pr-14 lg:pr-0">
          <Button variant={viewMode === 'month' ? 'default' : 'outline'} onClick={() => setViewMode('month')}>月</Button>
          <Button variant={viewMode === 'week' ? 'default' : 'outline'} onClick={() => setViewMode('week')}>週</Button>
          <Button variant={viewMode === 'day' ? 'default' : 'outline'} onClick={() => setViewMode('day')}>日</Button>
        </div>
        <div className="flex-grow p-4 rounded-md">
          {viewMode === 'month' && (
            <Calendar
              numberOfMonths={1}
              mode="single"
              selected={selectedDate}
              components={{ Day: DayComponent }}
              locale={ja}
              className="rounded-md border w-full"
            />
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
                {weekDays.map((day) => {
                  const daySchedules = schedules.filter(s => isSameDay(parseISO(s.date), day));
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "border p-2 rounded-md h-[7rem]",
                        isSameDay(day, selectedDate || new Date()) && "bg-accent/50 dark:bg-accent"
                      )}
                      onClick={() => isDesktop ? handleDesktopDayClick(day) : handleDaySelect(day)}
                    >
                      <div className="flex items-baseline mb-2">
                        <h3 className="font-bold mr-2">{format(day, "M/d (E)", { locale: ja })}</h3>
                      </div>
                      <div className="space-y-1 overflow-y-auto h-[calc(100%-2rem)]">
                        {daySchedules.length > 0 ? (
                          daySchedules.map((schedule) => (
                            <Tooltip key={schedule.id} delayDuration={200}>
                              <TooltipTrigger asChild>
                                <div className="truncate text-xs leading-tight bg-secondary rounded-sm px-1 py-0.5 cursor-default">
                                  {schedule.time} {schedule.title || '(タイトルなし)'}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <ScheduleTooltipContent schedule={schedule} />
                              </TooltipContent>
                            </Tooltip>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">予定なし</p>
                        )}
                      </div>
                    </div>
                  );
                })}
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
    </TooltipProvider>
  );
}