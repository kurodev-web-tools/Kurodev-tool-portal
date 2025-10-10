import { useState, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { ScheduleItem } from '@/types/schedule';

export interface ScheduleFilters {
  categories: string[];
  platforms: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

export function useScheduleFilter(schedules: ScheduleItem[]) {
  const [filters, setFilters] = useState<ScheduleFilters>({
    categories: [],
    platforms: [],
    dateRange: {
      start: '',
      end: ''
    }
  });

  // フィルタリングされたスケジュール
  const filteredSchedules = useMemo(() => {
    let filtered = [...schedules];

    // カテゴリフィルター
    if (filters.categories.length > 0) {
      filtered = filtered.filter(schedule => 
        schedule.category && filters.categories.includes(schedule.category)
      );
    }

    // プラットフォームフィルター
    if (filters.platforms.length > 0) {
      filtered = filtered.filter(schedule => 
        schedule.platform && filters.platforms.includes(schedule.platform)
      );
    }

    // 日付範囲フィルター
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(schedule => {
        const scheduleDate = parseISO(schedule.date);
        const start = filters.dateRange.start ? parseISO(filters.dateRange.start) : null;
        const end = filters.dateRange.end ? parseISO(filters.dateRange.end) : null;

        if (start && scheduleDate < start) return false;
        if (end && scheduleDate > end) return false;
        return true;
      });
    }

    return filtered;
  }, [schedules, filters]);

  // カテゴリフィルターのトグル
  const toggleCategoryFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // プラットフォームフィルターのトグル
  const togglePlatformFilter = (platform: string) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  // 日付範囲フィルターの設定
  const setDateRangeFilter = (start: string, end: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end }
    }));
  };

  // フィルターのリセット
  const resetFilters = () => {
    setFilters({
      categories: [],
      platforms: [],
      dateRange: { start: '', end: '' }
    });
  };

  // ユニークなカテゴリの取得
  const uniqueCategories = useMemo(() => {
    return Array.from(
      new Set(
        schedules
          .map(s => s.category)
          .filter((category): category is string => Boolean(category))
      )
    );
  }, [schedules]);

  // ユニークなプラットフォームの取得
  const uniquePlatforms = useMemo(() => {
    return Array.from(
      new Set(
        schedules
          .map(s => s.platform)
          .filter((platform): platform is string => Boolean(platform))
      )
    );
  }, [schedules]);

  // フィルターが適用されているかどうか
  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.platforms.length > 0 || 
    filters.dateRange.start !== '' || 
    filters.dateRange.end !== '';

  return {
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


