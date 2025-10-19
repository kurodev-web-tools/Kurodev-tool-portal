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
  ChevronRight,
  Calendar,
  Brain,
  Image,
  Sparkles,
  TrendingUp,
  Users,
  BarChart3,
  Wrench
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
        return <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-medium">公開済み</Badge>;
      case 'beta':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-sm font-medium">ベータ版</Badge>;
      case 'development':
        return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium">開発中</Badge>;
      default:
        return null;
    }
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'brain': return <Brain className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'sparkles': return <Sparkles className="h-4 w-4" />;
      case 'trending-up': return <TrendingUp className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'bar-chart': return <BarChart3 className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  if (items.length === 0) {
    return (
      <Card className={cn("bg-gray-900/30 border-gray-800 shadow-lg", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#20B2AA] to-[#1a9b94] flex items-center justify-center">
              <Icon className="h-3 w-3 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-100">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {/* 空状態でも同じレイアウト構造を使用 */}
            <div key="empty-state" className="group flex items-center p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-sm bg-[#20B2AA]/20 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#20B2AA]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-300 mb-1">
                    {emptyMessage}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {title === "お気に入り" ? "気に入ったツールをハートマークで追加しましょう" : 
                     title === "最近使用" ? "ツールを使用するとここに表示されます" : 
                     "人気のツールが表示されます"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-gray-900/30 border-gray-800 shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#20B2AA] to-[#1a9b94] flex items-center justify-center">
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
            className="h-8 w-8 p-0 text-gray-300 hover:text-[#20B2AA] hover:bg-[#20B2AA]/20 touch-manipulation border border-gray-600 hover:border-[#20B2AA]"
            aria-label="前のツールに移動"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="h-8 w-8 p-0 text-gray-300 hover:text-[#20B2AA] hover:bg-[#20B2AA]/20 touch-manipulation border border-gray-600 hover:border-[#20B2AA]"
            aria-label="次のツールに移動"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {/* クリアボタン（お気に入り以外） */}
          {items.length > 0 && title !== "お気に入り" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-300 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 p-0 touch-manipulation border border-gray-600 hover:border-red-400"
              aria-label={`${title}をクリア`}
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
                key={item.id || `item-${index}`}
                className="w-full flex-shrink-0 px-1"
                role="tabpanel"
                aria-hidden={index !== currentIndex}
              >
                <div
                  className="group flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                  onClick={() => onItemClick(item)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#20B2AA] flex items-center justify-center text-white group-hover:scale-110 transition-transform warm-cyber-glow">
                      {getIcon(item.iconName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-white group-hover:text-[#20B2AA] transition-colors truncate">
                          {item.title}
                        </h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-gray-300 truncate">
                        {item.description}
                        {title === "人気ツール" && (item as any).usageCount !== undefined && (
                          <span className="ml-2 text-[#20B2AA] font-medium">
                            ({(item as any).usageCount}回使用)
                          </span>
                        )}
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
                          if (item.id) {
                            onToggleFavorite(item);
                          }
                        }}
                        className={cn(
                          "h-8 w-8 p-0 transition-colors touch-manipulation",
                          item.id && isFavorite(item.id)
                            ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        )}
                        aria-label={item.id && isFavorite(item.id) ? 'お気に入りから削除' : 'お気に入りに追加'}
                      >
                        <Heart className={cn("h-3 w-3", item.id && isFavorite(item.id) && "fill-current")} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-[#20B2AA] hover:bg-[#20B2AA]/10 touch-manipulation"
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
                    ? "bg-[#20B2AA] w-6 border border-[#20B2AA]/30" 
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
