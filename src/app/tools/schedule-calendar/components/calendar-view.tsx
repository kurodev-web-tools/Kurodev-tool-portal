'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useScheduleFilter } from '../hooks/useScheduleFilter';
import { ScheduleFilters } from './ScheduleFilters';
import { ScheduleTooltipContent } from './ScheduleTooltip';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { SnsPostTab } from './sns-post-tab';
import { ScheduleList } from '@/components/schedule/schedule-list';
import { Calendar as CalendarIcon, Plus, Filter, CalendarDays } from 'lucide-react';

type ViewMode = 'month' | 'week' | 'day';

export function CalendarView() {
  const { setIsModalOpen, selectedDate, setSelectedDate, schedules } = useSchedule();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // カスタムフックでフィルタリング
  const {
    filters,
    filteredSchedules,
    toggleCategoryFilter,
    togglePlatformFilter,
    setDateRangeFilter,
    resetFilters,
    uniqueCategories,
    uniquePlatforms,
    hasActiveFilters
  } = useScheduleFilter(schedules);

  // ビューモードの保存と復元
  useEffect(() => {
    const savedViewMode = localStorage.getItem('calendarViewMode') as ViewMode;
    if (savedViewMode && ['month', 'week', 'day'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarViewMode', viewMode);
  }, [viewMode]);

  // ダブルクリック判定
  const [lastClickTime, setLastClickTime] = useState(0);
  const DOUBLE_CLICK_DELAY = 300;

  const handleDayDoubleClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const handleDaySelect = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
    } else {
      setSelectedDate(undefined);
    }
  };

  // PC用のクリックハンドラ（ダブルクリック判定付き）
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

  // 「今日」ボタンのクリックハンドラ
  const handleJumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
  };

  // 週表示用の日付配列
  const weekDays = currentDate
    ? eachDayOfInterval({ 
        start: startOfWeek(currentDate, { weekStartsOn: 1 }), 
        end: endOfWeek(currentDate, { weekStartsOn: 1 }) 
      })
    : [];

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-full">
        {/* ビュー切り替えコントロール */}
        <div className="flex items-center justify-between mb-6 p-4">
          {/* 左側：ビュー切り替えボタン + 今日ボタン（モバイル表示） */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#2D2D2D] rounded-lg p-1">
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
            
            {/* 今日ボタン（モバイル表示では月週日ボタンの横に配置） */}
            {!isDesktop && (
              <Button 
                size="sm" 
                onClick={handleJumpToToday}
                className="h-8 bg-[#20B2AA] hover:bg-[#20B2AA]/90 text-white border-[#20B2AA]"
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                今日
              </Button>
            )}
          </div>

          {/* 右側：アクションボタン */}
          <div className="flex items-center gap-2">
            {/* 今日ボタン（PC表示のみ） */}
            {isDesktop && (
              <Button 
                size="sm" 
                onClick={handleJumpToToday}
                className="h-8 bg-[#20B2AA] hover:bg-[#20B2AA]/90 text-white border-[#20B2AA]"
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                今日
              </Button>
            )}

            {/* フィルターコンポーネント */}
            <ScheduleFilters
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              filters={filters}
              toggleCategoryFilter={toggleCategoryFilter}
              togglePlatformFilter={togglePlatformFilter}
              setDateRangeFilter={setDateRangeFilter}
              resetFilters={resetFilters}
              uniqueCategories={uniqueCategories}
              uniquePlatforms={uniquePlatforms}
              hasActiveFilters={hasActiveFilters}
            />

            {/* 予定追加ボタン（PC表示のみ） */}
            {isDesktop && (
              <Button 
                size="sm" 
                onClick={() => setIsModalOpen(true)}
                className="h-8 bg-[#0070F3] hover:bg-[#0051CC] text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                予定追加
              </Button>
            )}
          </div>
        </div>

        {/* メインカレンダー表示エリア */}
        <div className={`flex-grow rounded-md ${isDesktop ? 'p-4' : 'p-2'} bg-[#1A1A1A] backdrop-blur-sm`}>
          <div className={`${isDesktop ? 'h-full md:overflow-y-auto' : 'min-h-full'}`}>
            {viewMode === 'month' && (
              <MonthView
                selectedDate={selectedDate}
                filteredSchedules={filteredSchedules}
                handleDesktopDayClick={handleDesktopDayClick}
                handleDaySelect={handleDaySelect}
                isDesktop={isDesktop}
                ScheduleTooltipContent={ScheduleTooltipContent}
              />
            )}
            {viewMode === 'week' && (
              <WeekView
                weekDays={weekDays}
                filteredSchedules={filteredSchedules}
                setSelectedDate={setSelectedDate}
                setIsModalOpen={setIsModalOpen}
                isDesktop={isDesktop}
              />
            )}
            {viewMode === 'day' && (
              <DayView
                selectedDate={selectedDate}
                filteredSchedules={filteredSchedules}
                isDesktop={isDesktop}
              />
            )}
          </div>

          {/* モバイル表示用の追加機能 */}
          {!isDesktop && (
            <div className="mt-6">
              <div className="bg-[#2D2D2D]/80 border border-[#4A4A4A]/30 rounded-lg p-4 backdrop-blur-sm">
                <Tabs defaultValue="sns" className="w-full">
                  <TabsList className="w-full h-12 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground">
                    <TabsTrigger value="sns" className="flex-1">
                      SNS投稿
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="flex-1">
                      予定一覧
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="sns" className="mt-4">
                    <SnsPostTab />
                  </TabsContent>
                  
                  <TabsContent value="schedule" className="mt-4">
                    <div
                      className="overflow-y-auto"
                      style={{
                        maxHeight: isDesktop ? 'min(32rem, calc(100vh - 16rem))' : 'min(28rem, 70vh)',
                      }}
                    >
                      <ScheduleList />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons for Mobile - Fixed Position */}
      <div className="fixed bottom-4 right-4 z-50 lg:hidden pointer-events-none">
        <div className="flex flex-col gap-3">
          {/* フィルターボタン */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-12 w-12 shadow-lg bg-white text-[#1F1F1F] pointer-events-auto"
                onClick={() => {
                  const newValue = !showFilters;
                  setShowFilters(newValue);
                }}
              >
                <Filter className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" align="center" className="text-xs">
              絞り込み
            </TooltipContent>
          </Tooltip>
          {/* 追加ボタン */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="rounded-full h-14 w-14 shadow-lg pointer-events-auto"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" align="center" className="text-xs">
              予定を追加
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
