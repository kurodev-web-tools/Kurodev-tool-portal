'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  X,
  Calendar,
  Palette,
  Users,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToolItem {
  id: string;
  title: string;
  description: string;
  status: 'released' | 'beta' | 'development';
  href: string;
  iconName?: string;
  color?: string;
  category: string;
  tags: string[];
  usageCount: number;
  rating: number;
}

interface EnhancedFilterProps {
  items: ToolItem[];
  onFilteredItemsChange: (items: ToolItem[]) => void;
  className?: string;
}

type SortOption = 'name-asc' | 'name-desc' | 'status-asc' | 'status-desc' | 'usage-desc' | 'rating-desc';
type CategoryFilter = 'all' | 'planning' | 'production' | 'branding' | 'collaboration';

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'すべて',
  planning: '企画・準備',
  production: '制作・編集',
  branding: 'ブランディング',
  collaboration: 'コラボ・連携'
};

const categoryIcons: Record<CategoryFilter, React.ComponentType<{ className?: string }>> = {
  all: Filter,
  planning: Calendar,
  production: Palette,
  branding: BarChart3,
  collaboration: Users
};

const sortLabels: Record<SortOption, string> = {
  'name-asc': '名前順（A-Z）',
  'name-desc': '名前順（Z-A）',
  'status-asc': 'ステータス順（公開済み→開発中）',
  'status-desc': 'ステータス順（開発中→公開済み）',
  'usage-desc': '使用回数順',
  'rating-desc': '評価順'
};

export function EnhancedFilter({ items, onFilteredItemsChange, className }: EnhancedFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [showFilters, setShowFilters] = useState(false);

  // 利用可能なタグを取得
  const availableTags = Array.from(new Set(items.flatMap(item => item.tags))).sort();

  // フィルタリングとソート
  useEffect(() => {
    let filtered = [...items];

    // カテゴリフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // ステータスフィルター
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // タグフィルター
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.title.localeCompare(b.title, 'ja');
        case 'name-desc':
          return b.title.localeCompare(a.title, 'ja');
        case 'status-asc':
          const statusOrder = { 'released': 0, 'beta': 1, 'development': 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'status-desc':
          const statusOrderDesc = { 'released': 2, 'beta': 1, 'development': 0 };
          return statusOrderDesc[a.status] - statusOrderDesc[b.status];
        case 'usage-desc':
          return b.usageCount - a.usageCount;
        case 'rating-desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    onFilteredItemsChange(filtered);
  }, [items, selectedCategory, selectedStatus, selectedTags, sortBy, onFilteredItemsChange]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedTags([]);
    setSortBy('name-asc');
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedStatus !== 'all',
    selectedTags.length > 0
  ].filter(Boolean).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* フィルターコントロール */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 h-10 px-4 touch-manipulation"
        >
          <Filter className="h-4 w-4" />
          <span>フィルター</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">並び順:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-400 hover:text-white h-10 px-3 touch-manipulation"
          >
            <X className="h-4 w-4 mr-1" />
            クリア
          </Button>
        )}
      </div>

      {/* フィルター詳細 */}
      {showFilters && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-4">
          {/* カテゴリフィルター */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">カテゴリ</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryLabels).map(([value, label]) => {
                const Icon = categoryIcons[value as CategoryFilter];
                return (
                  <Button
                    key={value}
                    variant={selectedCategory === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(value as CategoryFilter)}
                    className="flex items-center space-x-1 h-10 px-3 touch-manipulation"
                  >
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* ステータスフィルター */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">ステータス</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'すべて' },
                { value: 'released', label: '公開済み' },
                { value: 'beta', label: 'ベータ版' },
                { value: 'development', label: '開発中' }
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  variant={selectedStatus === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(value)}
                  className="h-10 px-3 touch-manipulation"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* タグフィルター */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">タグ</h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagToggle(tag)}
                  className="text-xs h-10 px-3 touch-manipulation"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
