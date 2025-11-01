'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { ShapeType } from '@/types/layers';
import { SHAPE_OPTIONS_BY_CATEGORY } from '@/utils/shapeUtils';

interface ShapeTypeSelectorProps {
  value: ShapeType;
  onChange: (shape: ShapeType) => void;
  className?: string;
}

/**
 * 図形タイプ選択用の共通コンポーネント
 * 
 * カテゴリ別に整理された16種類の図形タイプから選択できるUIを提供します。
 * アイコン付きで直感的に選択できます。
 * 
 * @param value - 現在選択されている図形タイプ
 * @param onChange - 図形タイプ変更時のコールバック
 * @param className - 外側のコンテナに適用するクラス名
 */
export const ShapeTypeSelector: React.FC<ShapeTypeSelectorProps> = ({ 
  value, 
  onChange,
  className 
}) => {
  // 現在選択されている図形がどのカテゴリに属するか判定
  const getCurrentCategory = (): string => {
    for (const [category, options] of Object.entries(SHAPE_OPTIONS_BY_CATEGORY)) {
      if (options.some(opt => opt.type === value)) {
        return category;
      }
    }
    return 'basic'; // デフォルト
  };

  const [activeTab, setActiveTab] = useState<string>(getCurrentCategory());

  // 選択された図形が変更されたらタブも更新
  useEffect(() => {
    setActiveTab(getCurrentCategory());
  }, [value]);

  return (
    <div className={cn("space-y-2", className)} data-testid="shape-type-selector">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="basic" className="text-xs px-2">基本</TabsTrigger>
          <TabsTrigger value="decorative" className="text-xs px-2">装飾</TabsTrigger>
          <TabsTrigger value="bubble" className="text-xs px-2">吹き出し</TabsTrigger>
          <TabsTrigger value="badge" className="text-xs px-2">バッジ</TabsTrigger>
        </TabsList>
        
        {Object.entries(SHAPE_OPTIONS_BY_CATEGORY).map(([category, options]) => (
          <TabsContent key={category} value={category} className="mt-3">
            <div className="grid grid-cols-3 gap-2">
              {options.map(option => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.type}
                    variant={value === option.type ? 'default' : 'outline'}
                    onClick={() => onChange(option.type)}
                    size="sm"
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 h-16",
                      value === option.type && "ring-2 ring-primary"
                    )}
                    data-testid={`shape-type-${option.type}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

