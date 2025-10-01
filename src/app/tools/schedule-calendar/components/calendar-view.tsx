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
import { Calendar as CalendarIcon, Plus, Filter } from 'lucide-react';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    platforms: [] as string[],
    dateRange: {
      start: '',
      end: ''
    }
  });
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
    const daySchedules = filteredSchedules.filter(s => isSameDay(parseISO(s.date), dateToUse));
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
                    {schedule.time || '未定'} {schedule.category || '未定'}
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
    const daySchedules = filteredSchedules.filter(s => isSameDay(parseISO(s.date), dateToUse));
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

  const weekDays = currentDate
    ? eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) })
    : [];


  const goToPreviousWeek = () => setSelectedDate((prev) => (prev ? subWeeks(prev, 1) : undefined));
  const goToNextWeek = () => setSelectedDate((prev) => (prev ? addWeeks(prev, 1) : undefined));

  // フィルター機能
  const filteredSchedules = schedules.filter(schedule => {
    // カテゴリフィルター
    if (filters.categories.length > 0 && !filters.categories.includes(schedule.category || '')) {
      return false;
    }
    
    // プラットフォームフィルター
    if (filters.platforms.length > 0 && !filters.platforms.includes(schedule.platform || '')) {
      return false;
    }
    
    // 日付範囲フィルター
    if (filters.dateRange.start && schedule.date < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && schedule.date > filters.dateRange.end) {
      return false;
    }
    
    return true;
  });

  const toggleCategoryFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const togglePlatformFilter = (platform: string) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      platforms: [],
      dateRange: { start: '', end: '' }
    });
  };

  const getUniqueCategories = () => {
    return Array.from(new Set(schedules.map(s => s.category).filter((category): category is string => Boolean(category))));
  };

  const getUniquePlatforms = () => {
    return Array.from(new Set(schedules.map(s => s.platform).filter((platform): platform is string => Boolean(platform))));
  };

  // 長時間配信の視覚化用のヘルパー関数
  const getScheduleDuration = (schedule: ScheduleItem) => {
    return schedule.duration || 60; // デフォルト60分
  };

  const getScheduleTimeSlots = (schedule: ScheduleItem) => {
    const duration = getScheduleDuration(schedule);
    const timeSlots = [];
    
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
  };

  const getScheduleForTimeSlot = (day: Date, hour: number) => {
    return filteredSchedules.find(schedule => {
      if (!isSameDay(parseISO(schedule.date), day) || !schedule.time) return false;
      
      const timeSlots = getScheduleTimeSlots(schedule);
      return timeSlots.some(slot => slot.hour === hour);
    });
  };

  const getScheduleForHalfHourSlot = (day: Date, hour: number, minute: number) => {
    return filteredSchedules.find(schedule => {
      if (!isSameDay(parseISO(schedule.date), day) || !schedule.time) return false;
      
      const timeSlots = getScheduleTimeSlots(schedule);
      return timeSlots.some(slot => slot.hour === hour && slot.minute === minute);
    });
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-full">
        {/* 改善されたビュー切り替えコントロール */}
        <div className="flex items-center justify-between mb-6 p-4">
          {/* ビュー切り替え */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              onClick={() => setViewMode('month')}
              className="h-8"
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              月
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              onClick={() => setViewMode('week')}
              className="h-8"
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              週
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              onClick={() => setViewMode('day')}
              className="h-8"
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              日
            </Button>
          </div>


          {/* アクションボタン */}
          <div className="flex items-center gap-2">
            {/* デスクトップ表示でのみフィルターボタンを表示 */}
            {isDesktop && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                フィルター
              </Button>
            )}
            {/* デスクトップ表示でのみ追加ボタンを表示 */}
            {isDesktop && (
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                追加
              </Button>
            )}
          </div>
        </div>

        {/* フィルターパネル */}
        {showFilters && (
          <div className="mb-4 p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">フィルター</h3>
              <Button size="sm" variant="outline" onClick={() => setShowFilters(false)}>
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* カテゴリフィルター */}
              <div>
                <label className="text-sm font-medium mb-2 block">カテゴリ</label>
                <div className="space-y-2">
                  {getUniqueCategories().map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleCategoryFilter(category)}
                        className="rounded"
                      />
                      <label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* プラットフォームフィルター */}
              <div>
                <label className="text-sm font-medium mb-2 block">プラットフォーム</label>
                <div className="space-y-2">
                  {getUniquePlatforms().map(platform => (
                    <div key={platform} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`platform-${platform}`}
                        checked={filters.platforms.includes(platform)}
                        onChange={() => togglePlatformFilter(platform)}
                        className="rounded"
                      />
                      <label htmlFor={`platform-${platform}`} className="text-sm">
                        {platform}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 日付範囲フィルター */}
              <div>
                <label className="text-sm font-medium mb-2 block">日付範囲</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    placeholder="開始日"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full p-2 border rounded text-sm"
                  />
                  <input
                    type="date"
                    placeholder="終了日"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={resetFilters}>
                リセット
              </Button>
              <Button size="sm" onClick={() => setShowFilters(false)}>
                適用
              </Button>
            </div>
          </div>
        )}

        {/* フィルター状態表示 */}
        {(filters.categories.length > 0 || filters.platforms.length > 0 || filters.dateRange.start || filters.dateRange.end) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.categories.map(category => (
              <Badge key={category} variant="secondary" className="cursor-pointer" onClick={() => toggleCategoryFilter(category)}>
                {category} ×
              </Badge>
            ))}
            {filters.platforms.map(platform => (
              <Badge key={platform} variant="secondary" className="cursor-pointer" onClick={() => togglePlatformFilter(platform)}>
                {platform} ×
              </Badge>
            ))}
            {(filters.dateRange.start || filters.dateRange.end) && (
              <Badge variant="secondary" className="cursor-pointer" onClick={resetFilters}>
                日付範囲 ×
              </Badge>
            )}
          </div>
        )}

        <div className={`flex-grow rounded-md ${isDesktop ? 'p-4' : 'p-2'} bg-slate-900/95 backdrop-blur-sm`}>
          <div className={`${isDesktop ? 'h-full overflow-y-auto' : 'min-h-full'}`}>
            {viewMode === 'month' && (
              <Calendar
                numberOfMonths={1}
                mode="single"
                selected={selectedDate}
                components={{ Day: DayComponent }}
                locale={ja}
                className={`rounded-md border border-slate-700/50 w-full bg-slate-800/80 backdrop-blur-sm ${isDesktop ? '' : 'text-sm'}`}
              />
            )}
            {viewMode === 'week' && (
              <>
                {isDesktop ? (
                  <div className="space-y-4">
                    {/* デスクトップ用：時間軸ヘッダー */}
                    <div className="flex">
                      <div className="w-16 text-sm text-gray-500">時間</div>
                      <div className="flex-1 grid grid-cols-7 gap-1">
                        {weekDays.map((day) => (
                          <div key={day.toISOString()} className="text-center text-sm font-medium">
                            <div>{format(day, 'M/d', { locale: ja })}</div>
                            <div className="text-xs text-gray-500">
                              {format(day, 'E', { locale: ja })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* デスクトップ用：時間軸グリッド */}
                    <div className="flex">
                      <div className="w-16 space-y-1">
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                          <div key={hour} className="text-xs text-gray-500 h-12 flex items-center justify-center">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 grid grid-cols-7 gap-1">
                        {weekDays.map((day) => (
                          <div key={day.toISOString()} className="space-y-1">
                            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                              <div
                                key={hour}
                                className="h-12 border border-slate-600/30 rounded cursor-pointer hover:bg-slate-700/50 transition-colors bg-slate-800/20 backdrop-blur-sm relative"
                                onClick={() => {
                                  const time = `${hour.toString().padStart(2, '0')}:00`;
                                  setSelectedDate(day);
                                  setIsModalOpen(true);
                                }}
                              >
                                {(() => {
                                  const schedule = getScheduleForTimeSlot(day, hour);
                                  if (!schedule) return null;
                                  
                                  const timeSlots = getScheduleTimeSlots(schedule);
                                  const hourSlots = timeSlots.filter(slot => slot.hour === hour);
                                  const isFirstHour = timeSlots[0].hour === hour;
                                  const isLastHour = timeSlots[timeSlots.length - 1].hour === hour;
                                  
                                  // 30分刻みの内部処理で視覚的に調整
                                  const topOffset = hourSlots[0]?.minute === 30 ? '50%' : '0%';
                                  const height = hourSlots.length === 2 ? '100%' : '50%';
                                  
                                  return (
                                    <div 
                                      className={`absolute left-0 right-0 p-1 text-xs bg-blue-500/80 text-white rounded backdrop-blur-sm`}
                                      style={{
                                        top: topOffset,
                                        height: height,
                                        borderRadius: isFirstHour ? '0.375rem 0.375rem 0 0' : 
                                                     isLastHour ? '0 0 0.375rem 0.375rem' : '0'
                                      }}
                                    >
                                      {isFirstHour && (
                                        <div className="font-medium truncate">
                                          {schedule.title || '(タイトルなし)'}
                                        </div>
                                      )}
                                      {isFirstHour && (
                                        <div className="text-xs opacity-75">
                                          {schedule.time} - {getScheduleDuration(schedule)}分
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* モバイル用：縦リスト表示 */
                  <div className="space-y-1">
                    {weekDays.map((day) => {
                      const daySchedules = filteredSchedules.filter(schedule => 
                        isSameDay(parseISO(schedule.date), day)
                      ).sort((a, b) => {
                        if (!a.time || !b.time) return 0;
                        return a.time.localeCompare(b.time);
                      });

                      return (
                        <div key={day.toISOString()} className="bg-slate-800/50 rounded-lg p-2">
                          {/* 日付ヘッダー */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-base font-semibold text-white">
                              {format(day, 'M/d', { locale: ja })}
                            </div>
                            <div className="text-xs text-gray-400">
                              {format(day, 'E', { locale: ja })}
                            </div>
                          </div>

                          {/* スケジュールリスト */}
                          {daySchedules.length > 0 ? (
                            <div className="space-y-0.5">
                              {daySchedules.map((schedule) => (
                                <div
                                  key={schedule.id}
                                  className="bg-blue-500/15 border border-blue-500/20 rounded px-2 py-1.5 cursor-pointer hover:bg-blue-500/25 transition-colors"
                                  onClick={() => {
                                    setSelectedDate(day);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    {/* 時間情報 */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <span className="text-xs text-blue-300 font-mono">
                                        {schedule.time}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {getScheduleDuration(schedule)}分
                                      </span>
                                    </div>
                                    
                                    {/* タイトル */}
                                    <div className="flex-1 min-w-0 text-center">
                                      <span className="text-sm text-white font-medium truncate block">
                                        {schedule.title || '(タイトルなし)'}
                                      </span>
                                    </div>
                                    
                                    {/* カテゴリ */}
                                    <div className="flex-shrink-0">
                                      {schedule.category && (
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                          {schedule.category}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs text-center py-1.5">
                              スケジュールなし
                            </div>
                          )}

                          {/* 新規追加ボタン */}
                          <div className="mt-2">
                            <button
                              className="w-full text-center py-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-md hover:bg-blue-500/10 transition-colors"
                              onClick={() => {
                                setSelectedDate(day);
                                setIsModalOpen(true);
                              }}
                            >
                              + 予定を追加
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
            {viewMode === 'day' && (
              <div className={isDesktop ? '' : 'px-2'}>
                <h2 className={`${isDesktop ? 'text-xl' : 'text-lg'} font-bold mb-4`}>日表示カレンダー</h2>
                {selectedDate && (
                  <div className={`${isDesktop ? 'mt-4' : 'mt-2'}`}>
                    <h3 className={`${isDesktop ? 'text-lg' : 'text-base'} font-semibold mb-3`}>
                      {format(selectedDate, "yyyy年MM月dd日", { locale: ja })} のスケジュール
                    </h3>
                    {filteredSchedules.filter(s => s.date === format(selectedDate, "yyyy-MM-dd")).length > 0 ? (
                      <ul className="space-y-2">
                        {filteredSchedules.filter(s => s.date === format(selectedDate, "yyyy-MM-dd")).map((schedule) => (
                          <li key={schedule.id} className={`${isDesktop ? 'p-3' : 'p-2'} border border-slate-600/30 rounded-md bg-slate-800/60 backdrop-blur-sm`}>
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

        {/* モバイル表示用の追加機能 */}
        {!isDesktop && (
          <div className="mt-6">
            <div className="bg-slate-800/80 border border-slate-600/30 rounded-lg p-4 backdrop-blur-sm">
              <Tabs defaultValue="sns" className="w-full">
                <TabsList className="w-full h-12 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground">
                  <TabsTrigger 
                    value="sns" 
                    className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    SNS投稿
                  </TabsTrigger>
                  <TabsTrigger 
                    value="schedule" 
                    className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    予定一覧
                  </TabsTrigger>
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
                        ? filteredSchedules.filter(s => isSameDay(parseISO(s.date), selectedDate))
                        : [];
                      return selectedDaySchedules.length > 0 ? (
                        <div className="space-y-2">
                          {selectedDaySchedules.map((schedule) => (
                            <div key={schedule.id} className="flex items-center justify-between p-2 bg-slate-700/60 rounded backdrop-blur-sm">
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
                      {filteredSchedules.length > 0 ? (
                        filteredSchedules.slice(0, 10).map((schedule) => (
                          <div key={schedule.id} className="flex items-center justify-between p-2 bg-slate-700/60 rounded backdrop-blur-sm">
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
      </div>

      {/* Floating Action Buttons for Mobile - Fixed Position */}
      <div className="fixed bottom-4 right-4 z-20 lg:hidden">
        <div className="flex flex-col gap-3">
          {/* フィルターボタン */}
          <Button
            size="icon"
            variant="outline"
            className="rounded-full h-12 w-12 shadow-lg bg-white dark:bg-slate-800"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
          </Button>
          {/* 追加ボタン */}
          <Button
            size="icon"
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}