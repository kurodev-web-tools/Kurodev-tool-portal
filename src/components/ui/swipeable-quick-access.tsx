'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Heart, 
  Star, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAccessItem } from "@/hooks/use-quick-access";

interface SwipeableQuickAccessProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: QuickAccessItem[];
  onItemClick: (item: QuickAccessItem) => void;
  onToggleFavorite: (item: QuickAccessItem) => void;
  isFavorite: (toolId: string) => boolean;
  onClear: () => void;
  showFavoriteToggle?: boolean;
  emptyMessage: string;
  className?: string;
}

export function SwipeableQuickAccess({ 
  title,
  icon: Icon, 
  items, 
  onItemClick, 
  onToggleFavorite, 
  isFavorite, 
  onClear,
  showFavoriteToggle = false,
  emptyMessage,
  className 
}: SwipeableQuickAccessProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const maxIndex = Math.max(0, items.length - 1);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaX = startX - currentX;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // 左にスワイプ（次のアイテム）
        setCurrentIndex(prev => prev === maxIndex ? 0 : prev + 1);
      } else if (deltaX < 0) {
        // 右にスワイプ（前のアイテム）
        setCurrentIndex(prev => prev === 0 ? maxIndex : prev - 1);
      }
    }

    setIsDragging(false);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? maxIndex : prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev === maxIndex ? 0 : prev + 1);
  };

  // 自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth;
      const scrollLeft = currentIndex * containerWidth;
      scrollRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  const getStatusBadge = (status: QuickAccessItem['status']) => {
    switch (status) {
      case 'released':
        return <Badge className="bg-green-200 text-green-900 border-green-300 dark:bg-green-800 dark:text-green-100 dark:border-green-600 text-xs status-released">公開済み</Badge>;
      case 'beta':
        return <Badge className="bg-yellow-200 text-yellow-900 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-600 text-xs status-beta">ベータ版</Badge>;
      case 'development':
        return <Badge className="bg-red-200 text-red-900 border-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600 text-xs status-development">開発中</Badge>;
      default:
        return null;
    }
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'calendar': return <Clock className="h-4 w-4" />;
      case 'brain': return <Heart className="h-4 w-4" />;
      case 'image': return <Star className="h-4 w-4" />;
      case 'sparkles': return <Clock className="h-4 w-4" />;
      case 'trending-up': return <Heart className="h-4 w-4" />;
      case 'users': return <Star className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (items.length === 0) {
    return (
      <Card className={cn("bg-gray-900/30 border-gray-800 shadow-lg", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Icon className="h-3 w-3 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-100">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-400 text-center py-4">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-gray-900/30 border-gray-800 shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <Icon className="h-3 w-3 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-100">{title}</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          {/* ナビゲーションボタン */}
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            className="h-8 w-8 p-0 text-gray-300 hover:text-blue-300 hover:bg-blue-500/20 touch-manipulation border border-gray-600 hover:border-blue-400"
            aria-label="前のツールに移動"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="h-8 w-8 p-0 text-gray-300 hover:text-blue-300 hover:bg-blue-500/20 touch-manipulation border border-gray-600 hover:border-blue-400"
            aria-label="次のツールに移動"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-300 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 p-0 touch-manipulation border border-gray-600 hover:border-red-400"
              aria-label="最近使用をクリア"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* スワイプ可能なコンテナ */}
        <div 
          ref={scrollRef}
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-label={`${title} - スワイプしてツールを切り替え`}
          aria-live="polite"
          aria-expanded="true"
          aria-controls={`${title}-content`}
        >
          <div 
            id={`${title}-content`}
            className="flex"
            role="tabpanel"
            aria-label={`${title}のコンテンツ`}
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                className="w-full flex-shrink-0 px-1"
                role="tabpanel"
                aria-hidden={index !== currentIndex}
              >
                <div
                  className="group flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                  onClick={() => onItemClick(item)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                      {getIcon(item.iconName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                          {item.title}
                        </h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-gray-300 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    {showFavoriteToggle && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item);
                        }}
                        className={cn(
                          "h-8 w-8 p-0 transition-colors touch-manipulation",
                          isFavorite(item.id)
                            ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        )}
                      >
                        <Heart className={cn("h-3 w-3", isFavorite(item.id) && "fill-current")} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 touch-manipulation"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* インジケーター */}
        {items.length > 1 && (
          <div 
            className="flex justify-center space-x-1 mt-3"
            role="tablist"
            aria-label={`${title}のページインジケーター`}
          >
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200 touch-manipulation",
                  index === currentIndex 
                    ? "bg-blue-300 w-6 border border-blue-200" 
                    : "bg-gray-500 hover:bg-gray-400 border border-gray-600"
                )}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`${index + 1}ページ目`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
