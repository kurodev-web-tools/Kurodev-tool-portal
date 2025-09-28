'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsData {
  totalTools: number;
  releasedTools: number;
  betaTools: number;
  developmentTools: number;
  totalSuites: number;
  toolProgress: number;
  suiteProgress: number;
}

interface SwipeableStatsProps {
  stats: StatsData;
  className?: string;
}

export function SwipeableStats({ stats, className }: SwipeableStatsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const statsCards = [
    {
      id: 'overview',
      title: '総数',
      icon: BarChart3,
      items: [
        { label: '利用可能なツールの総数', value: stats.totalTools, unit: '件' },
        { label: '連鎖ツールスイート', value: stats.totalSuites, unit: '件' }
      ]
    },
    {
      id: 'tools',
      title: 'ツール統計',
      icon: TrendingUp,
      items: [
        { label: '公開済み', value: stats.releasedTools, unit: '件', description: '現在利用可能なツール' },
        { label: 'ベータ', value: stats.betaTools, unit: '件', description: 'フィードバック募集中' },
        { label: '開発中', value: stats.developmentTools, unit: '件', description: '近日公開予定' }
      ]
    },
    {
      id: 'progress',
      title: '開発進捗',
      icon: Clock,
      items: [
        { 
          label: 'ツール開発進捗', 
          value: stats.toolProgress, 
          unit: '%', 
          description: `${Math.floor(stats.toolProgress * 8 / 100)} / 8 完了`,
          subDescription: `${8 - Math.floor(stats.toolProgress * 8 / 100)} 件残り`
        },
        { 
          label: 'スイート開発進捗', 
          value: stats.suiteProgress, 
          unit: '%', 
          description: `${Math.floor(stats.suiteProgress * 3 / 100)} / 3 完了`,
          subDescription: `${3 - Math.floor(stats.suiteProgress * 3 / 100)} 件残り`
        }
      ]
    }
  ];

  const maxIndex = statsCards.length - 1;

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
        // 左にスワイプ（次のカード）
        setCurrentIndex(prev => prev === maxIndex ? 0 : prev + 1);
      } else if (deltaX < 0) {
        // 右にスワイプ（前のカード）
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

  const currentCard = statsCards[currentIndex];

  return (
    <Card className={cn("bg-gray-900/30 border-gray-800 shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <currentCard.icon className="h-3 w-3 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-200">{currentCard.title}</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          {/* ナビゲーションボタン */}
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 touch-manipulation"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 touch-manipulation"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
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
        >
          <div className="flex">
            {statsCards.map((card, index) => (
              <div
                key={card.id}
                className="w-full flex-shrink-0 px-1"
              >
                <div className="space-y-4">
                  {card.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-4 rounded-lg bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-300">{item.label}</h3>
                        <div className="flex items-center space-x-1">
                          <span className="text-2xl font-bold text-blue-400">{item.value}</span>
                          <span className="text-sm text-gray-400">{item.unit}</span>
                        </div>
                      </div>
                      {'description' in item && item.description && (
                        <p className="text-xs text-gray-400 mb-1">{item.description}</p>
                      )}
                      {'subDescription' in item && item.subDescription && (
                        <p className="text-xs text-gray-500">{item.subDescription}</p>
                      )}
                      {/* 進捗バー（進捗カードの場合） */}
                      {card.id === 'progress' && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* インジケーター */}
        <div className="flex justify-center space-x-1 mt-4">
          {statsCards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200 touch-manipulation",
                index === currentIndex 
                  ? "bg-blue-400 w-6" 
                  : "bg-gray-600 hover:bg-gray-500"
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
