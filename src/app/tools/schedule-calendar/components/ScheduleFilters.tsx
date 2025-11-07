'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';
import { ScheduleFilters as FilterType } from '../hooks/useScheduleFilter';
import { createPortal } from 'react-dom';

interface ScheduleFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: FilterType;
  toggleCategoryFilter: (category: string) => void;
  togglePlatformFilter: (platform: string) => void;
  setDateRangeFilter: (start: string, end: string) => void;
  resetFilters: () => void;
  uniqueCategories: string[];
  uniquePlatforms: string[];
  hasActiveFilters: boolean;
}

export function ScheduleFilters({
  showFilters,
  setShowFilters,
  filters,
  toggleCategoryFilter,
  togglePlatformFilter,
  setDateRangeFilter,
  resetFilters,
  uniqueCategories,
  uniquePlatforms,
  hasActiveFilters
}: ScheduleFiltersProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // デバッグ用
  useEffect(() => {
    if (showFilters) {
      console.log('ScheduleFilters: showFilters is true, mobile panel should be visible');
      console.log('mobilePanelRef.current:', mobilePanelRef.current);
    }
  }, [showFilters]);

  const mobilePanel = showFilters ? (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 lg:hidden"
      onClick={() => setShowFilters(false)}
    >
      <div
        ref={mobilePanelRef}
        className="w-full max-w-md max-h-[80vh] overflow-y-auto p-4 bg-[#2D2D2D]/95 border border-[#4A4A4A] rounded-lg backdrop-blur-sm shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">フィルター</h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowFilters(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* カテゴリフィルター */}
          <div>
            <Label className="text-sm font-medium mb-2 block">カテゴリ</Label>
            <div className="space-y-2">
              {uniqueCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mobile-category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => toggleCategoryFilter(category)}
                  />
                  <label
                    htmlFor={`mobile-category-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* プラットフォームフィルター */}
          <div>
            <Label className="text-sm font-medium mb-2 block">プラットフォーム</Label>
            <div className="space-y-2">
              {uniquePlatforms.map(platform => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mobile-platform-${platform}`}
                    checked={filters.platforms.includes(platform)}
                    onCheckedChange={() => togglePlatformFilter(platform)}
                  />
                  <label
                    htmlFor={`mobile-platform-${platform}`}
                    className="text-sm cursor-pointer"
                  >
                    {platform}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 日付範囲フィルター */}
          <div>
            <Label className="text-sm font-medium mb-2 block">日付範囲</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="mobile-date-start" className="text-xs text-muted-foreground">開始日</Label>
                <Input
                  id="mobile-date-start"
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setDateRangeFilter(e.target.value, filters.dateRange.end)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mobile-date-end" className="text-xs text-muted-foreground">終了日</Label>
                <Input
                  id="mobile-date-end"
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setDateRangeFilter(filters.dateRange.start, e.target.value)}
                  className="mt-1"
                />
              </div>
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
    </div>
  ) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isDesktopPanel = panelRef.current && panelRef.current.contains(target);
      const isMobilePanel = mobilePanelRef.current && mobilePanelRef.current.contains(target);

      if (showFilters && !isDesktopPanel && !isMobilePanel) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters, setShowFilters]);

  return (
    <>
      {/* フィルターボタン（デスクトップ） */}
      <div className="hidden lg:block relative">
        {/* PC表示用のフィルターボタンとパネル */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="h-8"
        >
          <Filter className="h-4 w-4 mr-1" />
          フィルター
          {hasActiveFilters && (
            <Badge variant="destructive" className="ml-2 h-5 px-1">
              {filters.categories.length + filters.platforms.length}
            </Badge>
          )}
        </Button>

        {/* フィルターパネル */}
        {showFilters && (
          <div ref={panelRef} className="absolute right-0 top-full mt-2 w-96 p-4 bg-[#2D2D2D]/95 border border-[#4A4A4A] rounded-lg backdrop-blur-sm shadow-lg z-50">
            <h3 className="text-lg font-semibold mb-4">フィルター</h3>

            <div className="space-y-4">
              {/* カテゴリフィルター */}
              <div>
                <Label className="text-sm font-medium mb-2 block">カテゴリ</Label>
                <div className="space-y-2">
                  {uniqueCategories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => toggleCategoryFilter(category)}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* プラットフォームフィルター */}
              <div>
                <Label className="text-sm font-medium mb-2 block">プラットフォーム</Label>
                <div className="space-y-2">
                  {uniquePlatforms.map(platform => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={`platform-${platform}`}
                        checked={filters.platforms.includes(platform)}
                        onCheckedChange={() => togglePlatformFilter(platform)}
                      />
                      <label
                        htmlFor={`platform-${platform}`}
                        className="text-sm cursor-pointer"
                      >
                        {platform}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 日付範囲フィルター */}
              <div>
                <Label className="text-sm font-medium mb-2 block">日付範囲</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="date-start" className="text-xs text-muted-foreground">開始日</Label>
                    <Input
                      id="date-start"
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setDateRangeFilter(e.target.value, filters.dateRange.end)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-end" className="text-xs text-muted-foreground">終了日</Label>
                    <Input
                      id="date-end"
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setDateRangeFilter(filters.dateRange.start, e.target.value)}
                      className="mt-1"
                    />
                  </div>
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

        {/* アクティブフィルターのバッジ表示 */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.categories.map(category => (
              <Badge
                key={category}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleCategoryFilter(category)}
              >
                {category} ×
              </Badge>
            ))}
            {filters.platforms.map(platform => (
              <Badge
                key={platform}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => togglePlatformFilter(platform)}
              >
                {platform} ×
              </Badge>
            ))}
            {(filters.dateRange.start || filters.dateRange.end) && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={resetFilters}
              >
                日付範囲 ×
              </Badge>
            )}
          </div>
        )}
      </div>
      {mounted ? createPortal(mobilePanel, document.body) : null}
    </>
  );
}


