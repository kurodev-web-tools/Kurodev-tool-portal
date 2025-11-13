import { useState, useEffect } from 'react';
import { useScheduleFilter, ScheduleFilters } from './useScheduleFilter';
import { ScheduleItem } from '@/types/schedule';

export type MobileTab = 'sns' | 'schedule';

export interface UseScheduleFiltersReturn {
  // フィルター表示状態
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  
  // モバイルタブ選択状態
  selectedTab: MobileTab;
  setSelectedTab: (tab: MobileTab) => void;
  
  // フィルター値とロジック（useScheduleFilterから継承）
  filters: ScheduleFilters;
  filteredSchedules: ScheduleItem[];
  toggleCategoryFilter: (category: string) => void;
  togglePlatformFilter: (platform: string) => void;
  setDateRangeFilter: (start: string, end: string) => void;
  resetFilters: () => void;
  uniqueCategories: string[];
  uniquePlatforms: string[];
  hasActiveFilters: boolean;
}

/**
 * Schedule Calendarのフィルター関連の状態管理を統合するフック
 * - フィルター表示状態（showFilters）
 * - モバイルタブ選択状態（selectedTab）
 * - フィルター値とロジック（useScheduleFilterから継承）
 */
export function useScheduleFilters(schedules: ScheduleItem[]): UseScheduleFiltersReturn {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTab, setSelectedTab] = useState<MobileTab>('sns');

  // 既存のuseScheduleFilterフックを使用
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

  // モバイルタブの状態をlocalStorageに保存
  useEffect(() => {
    const savedTab = localStorage.getItem('scheduleCalendarMobileTab') as MobileTab;
    if (savedTab && (savedTab === 'sns' || savedTab === 'schedule')) {
      setSelectedTab(savedTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scheduleCalendarMobileTab', selectedTab);
  }, [selectedTab]);

  return {
    showFilters,
    setShowFilters,
    selectedTab,
    setSelectedTab,
    filters,
    filteredSchedules,
    toggleCategoryFilter,
    togglePlatformFilter,
    setDateRangeFilter,
    resetFilters,
    uniqueCategories,
    uniquePlatforms,
    hasActiveFilters
  };
}


