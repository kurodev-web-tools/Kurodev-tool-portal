"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  items: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    href: string;
    iconName?: string;
    color?: string;
  }>;
  onItemClick?: (item: any) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  items, 
  onItemClick, 
  placeholder = "ツールを検索...",
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // 検索ロジック
  const filteredItems = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.status.toLowerCase().includes(searchTerm)
    );
  }, [items, query]);

  const handleItemClick = (item: any) => {
    onItemClick?.(item);
    setQuery("");
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => setIsOpen(query.length > 0)}
          className="pl-10 pr-10 w-full bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="ツール検索"
          aria-describedby="search-results"
          aria-expanded={isOpen}
          aria-controls="search-results"
          role="combobox"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500"
            aria-label="検索をクリア"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 検索結果ドロップダウン */}
      {isOpen && (
        <div 
          id="search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
          role="listbox"
          aria-label="検索結果"
        >
          {filteredItems.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-gray-300 px-3 py-2 border-b border-gray-700/50">
                {filteredItems.length}件のツールが見つかりました
              </div>
              {filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                  role="option"
                  aria-selected="false"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleItemClick(item);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-sm group-hover:scale-110 transition-transform`}>
                      {item.iconName === 'calendar' && '📅'}
                      {item.iconName === 'brain' && '🧠'}
                      {item.iconName === 'image' && '🖼️'}
                      {item.iconName === 'sparkles' && '✨'}
                      {item.iconName === 'trending-up' && '📈'}
                      {!['calendar', 'brain', 'image', 'sparkles', 'trending-up'].includes(item.iconName || '') && '🔧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                          {item.title}
                        </h3>
                        <Badge 
                          className={`text-xs status-${item.status} ${
                            item.status === 'released' ? 'bg-green-200 text-green-900 border-green-300 dark:bg-green-800 dark:text-green-100 dark:border-green-600' :
                            item.status === 'beta' ? 'bg-yellow-200 text-yellow-900 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-600' :
                            'bg-red-200 text-red-900 border-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600'
                          }`}
                        >
                          {item.status === 'released' ? '公開済み' : 
                           item.status === 'beta' ? 'ベータ版' : '開発中'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-300 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">「{query}」に一致するツールが見つかりません</p>
              <p className="text-xs mt-1">別のキーワードで検索してみてください</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
