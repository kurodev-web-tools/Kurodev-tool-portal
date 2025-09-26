'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSchedule } from '@/contexts/ScheduleContext';
import { DayProps } from 'react-day-picker';
import { ScheduleItem } from '@/types/schedule';
import { useMediaQuery } from '@/hooks/use-media-query';
import { SnsPostTab } from './sns-post-tab';

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
          <Button 
            variant={viewMode === 'month' ? 'default' : 'outline'} 
            onClick={() => setViewMode('month')}
            size={isDesktop ? "default" : "sm"}
          >
            月
          </Button>
          <Button 
            variant={viewMode === 'week' ? 'default' : 'outline'} 
            onClick={() => setViewMode('week')}
            size={isDesktop ? "default" : "sm"}
          >
            週
          </Button>
          <Button 
            variant={viewMode === 'day' ? 'default' : 'outline'} 
            onClick={() => setViewMode('day')}
            size={isDesktop ? "default" : "sm"}
          >
            日
          </Button>
        </div>
        <div className={`flex-grow rounded-md ${isDesktop ? 'p-4' : 'p-2'}`}>
          {viewMode === 'month' && (
            <Calendar
              numberOfMonths={1}
              mode="single"
              selected={selectedDate}
              components={{ Day: DayComponent }}
              locale={ja}
              className={`rounded-md border w-full ${isDesktop ? '' : 'text-sm'}`}
            />
          )}
          {viewMode === 'week' && (
            <div>
              <div className={`flex items-center justify-between mb-4 ${isDesktop ? '' : 'px-2'}`}>
                <Button 
                  variant="outline" 
                  onClick={goToPreviousWeek}
                  size={isDesktop ? "default" : "sm"}
                >
                  ←
                </Button>
                <h3 className={`font-bold ${isDesktop ? 'text-lg' : 'text-base'}`}>
                  {selectedDate ? format(startOfWeek(selectedDate, { weekStartsOn: 0 }), "M月", { locale: ja }) : ''}
                  第{selectedDate ? Math.ceil(Number(format(selectedDate, "d", { locale: ja })) / 7) : ''}週
                </h3>
                <Button 
                  variant="outline" 
                  onClick={goToNextWeek}
                  size={isDesktop ? "default" : "sm"}
                >
                  →
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {weekDays.map((day) => {
                  const daySchedules = schedules.filter(s => isSameDay(parseISO(s.date), day));
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        `border rounded-md ${isDesktop ? 'p-2 h-[7rem]' : 'p-1 h-[5rem]'}`,
                        isSameDay(day, selectedDate || new Date()) && "bg-accent/50 dark:bg-accent"
                      )}
                      onClick={() => isDesktop ? handleDesktopDayClick(day) : handleDaySelect(day)}
                    >
                      <div className={`flex items-baseline ${isDesktop ? 'mb-2' : 'mb-1'}`}>
                        <h3 className={`font-bold mr-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                          {format(day, "M/d (E)", { locale: ja })}
                        </h3>
                      </div>
                      <div className={`space-y-1 overflow-y-auto ${isDesktop ? 'h-[calc(100%-2rem)]' : 'h-[calc(100%-1.5rem)]'}`}>
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
            <div className={isDesktop ? '' : 'px-2'}>
              <h2 className={`${isDesktop ? 'text-xl' : 'text-lg'} font-bold mb-4`}>日表示カレンダー</h2>
              {selectedDate && (
                <div className={`${isDesktop ? 'mt-4' : 'mt-2'}`}>
                  <h3 className={`${isDesktop ? 'text-lg' : 'text-base'} font-semibold mb-3`}>
                    {format(selectedDate, "yyyy年MM月dd日", { locale: ja })} のスケジュール
                  </h3>
                  {schedules.filter(s => s.date === format(selectedDate, "yyyy-MM-dd")).length > 0 ? (
                    <ul className="space-y-2">
                      {schedules.filter(s => s.date === format(selectedDate, "yyyy-MM-dd")).map((schedule) => (
                        <li key={schedule.id} className={`${isDesktop ? 'p-3' : 'p-2'} border rounded-md bg-card`}>
                          <p className={`${isDesktop ? 'text-sm' : 'text-xs'} font-medium`}><strong>タイトル:</strong> {schedule.title}</p>
                          <p className={`${isDesktop ? 'text-sm' : 'text-xs'}`}><strong>時間:</strong> {schedule.time}</p>
                          <p className={`${isDesktop ? 'text-sm' : 'text-xs'}`}><strong>カテゴリ:</strong> {schedule.category}</p>
                          <p className={`${isDesktop ? 'text-sm' : 'text-xs'}`}><strong>プラットフォーム:</strong> {schedule.platform}</p>
                          <p className={`${isDesktop ? 'text-sm' : 'text-xs'}`}><strong>備考:</strong> {schedule.notes}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={`${isDesktop ? 'text-base' : 'text-sm'} text-muted-foreground`}>この日のスケジュールはありません。</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* モバイル表示用の追加機能 */}
        {!isDesktop && (
          <div className="mt-6">
            <div className="bg-card border rounded-lg p-4">
              <Tabs defaultValue="sns" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sns">SNS投稿</TabsTrigger>
                  <TabsTrigger value="schedule">予定一覧</TabsTrigger>
                </TabsList>
                
                <TabsContent value="sns" className="mt-4">
                  <SnsPostTab />
                </TabsContent>
                
                <TabsContent value="schedule" className="mt-4 space-y-4">
                  {/* 選択日の予定セクション */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">選択日の予定</h3>
                    {(() => {
                      const selectedDaySchedules = selectedDate 
                        ? schedules.filter(s => isSameDay(parseISO(s.date), selectedDate))
                        : [];
                      return selectedDaySchedules.length > 0 ? (
                        <div className="space-y-2">
                          {selectedDaySchedules.map((schedule) => (
                            <div key={schedule.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                              <div>
                                <p className="font-medium text-sm">{schedule.title || '(タイトルなし)'}</p>
                                <p className="text-xs text-muted-foreground">{schedule.time}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {schedule.category}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {selectedDate ? '選択日の予定はありません' : '日付を選択してください'}
                        </p>
                      );
                    })()}
                  </div>

                  {/* 予定一覧セクション */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">予定一覧</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {schedules.length > 0 ? (
                        schedules.slice(0, 10).map((schedule) => (
                          <div key={schedule.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{schedule.title || '(タイトルなし)'}</p>
                              <p className="text-xs text-muted-foreground">{format(parseISO(schedule.date), "M/d HH:mm")}</p>
                            </div>
                            <Badge variant="outline" className="text-xs ml-2">
                              {schedule.category}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">予定はありません</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}