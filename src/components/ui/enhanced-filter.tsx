'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter, useSearchParams } from 'next/navigation';
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

type SortOption = 'name-asc' | 'name-desc' | 'status-asc' | 'status-desc' | 'usage-desc' | 'rating-desc' | 'category-asc' | 'category-desc' | 'recent' | 'favorites';
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
  'rating-desc': '評価順',
  'category-asc': 'カテゴリ順（A-Z）',
  'category-desc': 'カテゴリ順（Z-A）',
  'recent': '最近追加順',
  'favorites': 'お気に入り順'
};

export function EnhancedFilter({ items, onFilteredItemsChange, className }: EnhancedFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URLパラメータから初期値を取得
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(
    (searchParams?.get('category') as CategoryFilter) || 'all'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams?.get('status') || 'all'
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams?.get('tags') ? searchParams.get('tags')!.split(',') : []
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams?.get('sort') as SortOption) || 'name-asc'
  );
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams?.get('search') || ''
  );
  const [filteredItems, setFilteredItems] = useState<ToolItem[]>(items);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // 利用可能なタグを取得
  const availableTags = Array.from(new Set(items.flatMap(item => item.tags))).sort();
  
  // 検索履歴の読み込み
  useEffect(() => {
    const savedHistory = localStorage.getItem('vtuber-tools-search-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  // 検索履歴の保存
  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('vtuber-tools-search-history', JSON.stringify(newHistory));
  };

  // URLパラメータの更新
  const updateURL = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (sortBy !== 'name-asc') params.set('sort', sortBy);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.replace(newURL, { scroll: false });
  };

  // フィルタリングとソート
  useEffect(() => {
    let filtered = [...items];

    // 検索クエリフィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

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
        case 'category-asc':
          return a.category.localeCompare(b.category, 'ja');
        case 'category-desc':
          return b.category.localeCompare(a.category, 'ja');
        case 'recent':
          // 最近追加順（IDの数値部分で判定、大きい方が新しい）
          const aId = parseInt(a.id.split('-').pop() || '0');
          const bId = parseInt(b.id.split('-').pop() || '0');
          return bId - aId;
        case 'favorites':
          // お気に入り順（お気に入りを先に表示）
          const favorites = JSON.parse(localStorage.getItem('vtuber-tools-favorites') || '[]');
          const aIsFavorite = favorites.includes(a.id);
          const bIsFavorite = favorites.includes(b.id);
          if (aIsFavorite && !bIsFavorite) return -1;
          if (!aIsFavorite && bIsFavorite) return 1;
          return 0;
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
    onFilteredItemsChange(filtered);
    
    // URLパラメータを更新
    updateURL();
  }, [items, searchQuery, selectedCategory, selectedStatus, selectedTags, sortBy, onFilteredItemsChange]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedTags([]);
    setSortBy('name-asc');
  };

  const activeFiltersCount = [
    searchQuery.trim() !== '',
    selectedCategory !== 'all',
    selectedStatus !== 'all',
    selectedTags.length > 0
  ].filter(Boolean).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 検索・フィルターコントロール */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 検索バー */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ツールを検索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowSearchSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveSearchHistory(searchQuery);
                setShowSearchSuggestions(false);
              }
            }}
            className="pl-10 pr-4 w-full bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#20B2AA] focus:border-transparent"
            aria-label="ツール検索"
          />
          
          {/* 検索履歴・おすすめ */}
          {showSearchSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {searchHistory.length > 0 && (
                <div className="p-2">
                  <div className="text-xs text-gray-400 mb-2 px-2">最近の検索</div>
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(item);
                        saveSearchHistory(item);
                        setShowSearchSuggestions(false);
                      }}
                      className="w-full text-left px-2 py-1 text-sm text-gray-300 hover:bg-gray-800 rounded flex items-center space-x-2"
                    >
                      <Search className="h-3 w-3 text-gray-500" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* おすすめ検索 */}
              <div className="p-2 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-2 px-2">おすすめ</div>
                {['企画', '制作', '分析', '公開済み', 'ベータ版'].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      saveSearchHistory(suggestion);
                      setShowSearchSuggestions(false);
                    }}
                    className="w-full text-left px-2 py-1 text-sm text-gray-300 hover:bg-gray-800 rounded flex items-center space-x-2"
                  >
                    <span className="text-[#20B2AA]">#</span>
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 h-10 px-4 touch-manipulation border-[#20B2AA] text-[#20B2AA] hover:bg-[#20B2AA] hover:text-white transition-all duration-200"
        >
          <Filter className="h-4 w-4" />
          <span>フィルター</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-[#20B2AA] text-white">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">並び順:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-gray-800 border border-[#20B2AA] rounded px-2 py-1 text-sm text-white focus:border-[#20B2AA] focus:outline-none focus:ring-1 focus:ring-[#20B2AA]"
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
            className="text-gray-400 hover:text-[#20B2AA] hover:bg-[#20B2AA]/10 h-10 px-3 touch-manipulation transition-all duration-200"
          >
            <X className="h-4 w-4 mr-1" />
            クリア
          </Button>
        )}
      </div>

      {/* フィルター結果数表示 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          <span className="font-medium text-[#20B2AA]">{filteredItems.length}</span>
          <span>件のツールが見つかりました</span>
          {filteredItems.length !== items.length && (
            <span className="text-gray-500 ml-1">
              （全{items.length}件中）
            </span>
          )}
        </div>
      </div>

      {/* PC: よく使われるフィルターを常時表示 */}
      <div className="hidden md:block">
        <div className="bg-gray-900/50 border border-[#20B2AA]/30 rounded-lg p-4 space-y-4 warm-cyber-glow">
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
                    className={`flex items-center space-x-1 h-10 px-3 touch-manipulation transition-all duration-200 ${
                      selectedCategory === value 
                        ? "bg-[#20B2AA] text-white hover:bg-[#1a9b94]" 
                        : "border-[#20B2AA] text-[#20B2AA] hover:bg-[#20B2AA] hover:text-white"
                    }`}
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
                  className={`h-10 px-3 touch-manipulation transition-all duration-200 ${
                    selectedStatus === value 
                      ? "bg-[#20B2AA] text-white hover:bg-[#1a9b94]" 
                      : "border-[#20B2AA] text-[#20B2AA] hover:bg-[#20B2AA] hover:text-white"
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* モバイル: ボタンで開閉 */}
      <div className="block md:hidden">
        {showFilters && (
          <div className="bg-gray-900/50 border border-[#20B2AA]/30 rounded-lg p-4 space-y-4 warm-cyber-glow">
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
                      className={`flex items-center space-x-1 h-10 px-3 touch-manipulation transition-all duration-200 ${
                        selectedCategory === value 
                          ? "bg-[#20B2AA] text-white hover:bg-[#1a9b94]" 
                          : "border-[#20B2AA] text-[#20B2AA] hover:bg-[#20B2AA] hover:text-white"
                      }`}
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
                    className={`h-10 px-3 touch-manipulation transition-all duration-200 ${
                      selectedStatus === value 
                        ? "bg-[#20B2AA] text-white hover:bg-[#1a9b94]" 
                        : "border-[#20B2AA] text-[#20B2AA] hover:bg-[#20B2AA] hover:text-white"
                    }`}
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
                    className={`text-xs h-10 px-3 touch-manipulation transition-all duration-200 ${
                      selectedTags.includes(tag)
                        ? "bg-[#20B2AA] text-white hover:bg-[#1a9b94]" 
                        : "border-[#20B2AA] text-[#20B2AA] hover:bg-[#20B2AA] hover:text-white"
                    }`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
