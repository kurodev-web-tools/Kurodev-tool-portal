"use client";

import { useState, useMemo, useCallback } from "react";

interface SearchableItem {
  id: string;
  title: string;
  description: string;
  status: string;
  href: string;
  iconName?: string;
  color?: string;
  tags?: string[];
}

interface UseSearchOptions {
  items: SearchableItem[];
  searchFields?: (keyof SearchableItem)[];
  minQueryLength?: number;
}

export function useSearch({ 
  items, 
  searchFields = ['title', 'description', 'status'],
  minQueryLength = 1 
}: UseSearchOptions) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // 検索結果の計算
  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < minQueryLength) {
      return [];
    }

    const searchTerm = query.toLowerCase();
    const results = items.filter(item => {
      return searchFields.some(field => {
        const fieldValue = item[field];
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(searchTerm);
        }
        return false;
      });
    });

    // 関連度でソート（タイトル > 説明 > ステータス）
    return results.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
      const bTitleMatch = b.title.toLowerCase().includes(searchTerm);
      
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      const aDescMatch = a.description.toLowerCase().includes(searchTerm);
      const bDescMatch = b.description.toLowerCase().includes(searchTerm);
      
      if (aDescMatch && !bDescMatch) return -1;
      if (!aDescMatch && bDescMatch) return 1;
      
      return 0;
    });
  }, [items, query, searchFields, minQueryLength]);

  // 検索クエリの更新
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setIsSearching(newQuery.length > 0);
  }, []);

  // 検索のクリア
  const clearSearch = useCallback(() => {
    setQuery("");
    setIsSearching(false);
  }, []);

  // 検索結果の統計
  const searchStats = useMemo(() => {
    const total = items.length;
    const found = searchResults.length;
    const hasResults = found > 0;
    
    return {
      total,
      found,
      hasResults,
      isEmpty: query.length > 0 && found === 0,
      isSearching: isSearching && query.length >= minQueryLength
    };
  }, [items.length, searchResults.length, query, isSearching, minQueryLength]);

  return {
    query,
    searchResults,
    searchStats,
    updateQuery,
    clearSearch,
    setIsSearching
  };
}
