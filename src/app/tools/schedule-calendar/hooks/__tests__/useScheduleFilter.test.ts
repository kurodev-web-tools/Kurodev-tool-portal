import { renderHook, act } from '@testing-library/react';
import { useScheduleFilter } from '../useScheduleFilter';
import { ScheduleItem } from '@/types/schedule';

describe('useScheduleFilter', () => {
  const mockSchedules: ScheduleItem[] = [
    {
      id: '1',
      date: '2025-10-10',
      time: '10:00',
      duration: 60,
      title: '雑談配信',
      category: '雑談',
      platform: 'YouTube'
    },
    {
      id: '2',
      date: '2025-10-10',
      time: '20:00',
      duration: 120,
      title: 'ゲーム配信',
      category: 'ゲーム',
      platform: 'Twitch'
    },
    {
      id: '3',
      date: '2025-10-15',
      time: '15:00',
      duration: 90,
      title: '歌枠',
      category: '歌',
      platform: 'YouTube'
    }
  ];

  describe('初期状態', () => {
    it('フィルターなしで全てのスケジュールが表示される', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      expect(result.current.filteredSchedules).toHaveLength(3);
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('ユニークなカテゴリを取得できる', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      expect(result.current.uniqueCategories).toEqual(['雑談', 'ゲーム', '歌']);
    });

    it('ユニークなプラットフォームを取得できる', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      expect(result.current.uniquePlatforms).toEqual(['YouTube', 'Twitch']);
    });
  });

  describe('カテゴリフィルター', () => {
    it('カテゴリでフィルタリングできる', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      act(() => {
        result.current.toggleCategoryFilter('ゲーム');
      });
      
      expect(result.current.filteredSchedules).toHaveLength(1);
      expect(result.current.filteredSchedules[0].category).toBe('ゲーム');
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('複数のカテゴリでフィルタリングできる', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      act(() => {
        result.current.toggleCategoryFilter('雑談');
        result.current.toggleCategoryFilter('歌');
      });
      
      expect(result.current.filteredSchedules).toHaveLength(2);
      expect(result.current.filteredSchedules.map(s => s.category)).toEqual(['雑談', '歌']);
    });

    it('カテゴリフィルターのトグルで解除できる', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      act(() => {
        result.current.toggleCategoryFilter('ゲーム');
      });
      expect(result.current.filteredSchedules).toHaveLength(1);
      
      act(() => {
        result.current.toggleCategoryFilter('ゲーム');
      });
      expect(result.current.filteredSchedules).toHaveLength(3);
    });
  });

  describe('プラットフォームフィルター', () => {
    it('プラットフォームでフィルタリングできる', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      act(() => {
        result.current.togglePlatformFilter('YouTube');
      });
      
      expect(result.current.filteredSchedules).toHaveLength(2);
      expect(result.current.filteredSchedules.every(s => s.platform === 'YouTube')).toBe(true);
    });
  });

  describe('日付範囲フィルター', () => {
    it('開始日以降のスケジュールをフィルタリングできる', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      act(() => {
        result.current.setDateRangeFilter('2025-10-12', '');
      });
      
      expect(result.current.filteredSchedules).toHaveLength(1);
      expect(result.current.filteredSchedules[0].id).toBe('3');
    });

    it('終了日以前のスケジュールをフィルタリングできる', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      act(() => {
        result.current.setDateRangeFilter('', '2025-10-12');
      });
      
      expect(result.current.filteredSchedules).toHaveLength(2);
      expect(result.current.filteredSchedules.map(s => s.id)).toEqual(['1', '2']);
    });

    it('日付範囲でフィルタリングできる', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      act(() => {
        result.current.setDateRangeFilter('2025-10-10', '2025-10-10');
      });
      
      expect(result.current.filteredSchedules).toHaveLength(2);
    });
  });

  describe('複合フィルター', () => {
    it('カテゴリとプラットフォームを組み合わせられる', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      act(() => {
        result.current.toggleCategoryFilter('雑談');
        result.current.togglePlatformFilter('YouTube');
      });
      
      expect(result.current.filteredSchedules).toHaveLength(1);
      expect(result.current.filteredSchedules[0].id).toBe('1');
    });
  });

  describe('フィルターのリセット', () => {
    it('全てのフィルターをリセットできる', () => {
      const { result } = renderHook(() => useScheduleFilter(mockSchedules));
      
      act(() => {
        result.current.toggleCategoryFilter('ゲーム');
        result.current.togglePlatformFilter('Twitch');
        result.current.setDateRangeFilter('2025-10-10', '2025-10-12');
      });
      
      expect(result.current.hasActiveFilters).toBe(true);
      
      act(() => {
        result.current.resetFilters();
      });
      
      expect(result.current.filteredSchedules).toHaveLength(3);
      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.filters).toEqual({
        categories: [],
        platforms: [],
        dateRange: { start: '', end: '' }
      });
    });
  });
});


