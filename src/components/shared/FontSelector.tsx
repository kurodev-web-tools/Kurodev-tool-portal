'use client';

import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { googleFonts, fontCategories } from '@/data/fonts';
import { cn } from '@/lib/utils';

interface FontSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  showCategoryLabels?: boolean;
  className?: string;
  triggerClassName?: string;
}

/**
 * フォント選択用の共通コンポーネント
 * 
 * Google Fonts と システムフォントを選択できるセレクトボックス。
 * カテゴリ別にグループ化されており、統一されたUIを提供します。
 * 
 * @param value - 現在選択されているフォント（例: "Noto Sans JP, sans-serif"）
 * @param onValueChange - フォント変更時のコールバック
 * @param showCategoryLabels - カテゴリラベルを表示するか（デフォルト: true）
 * @param className - 外側のコンテナに適用するクラス名
 * @param triggerClassName - SelectTriggerに適用するクラス名
 */
export const FontSelector: React.FC<FontSelectorProps> = ({ 
  value, 
  onValueChange,
  showCategoryLabels = true,
  className,
  triggerClassName
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("h-8 text-xs", triggerClassName)} data-testid="font-selector-trigger">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={className}>
        {fontCategories.map(category => {
          const fonts = googleFonts.filter(f => f.category === category.key);
          return (
            <SelectGroup key={category.key}>
              {showCategoryLabels && <SelectLabel>{category.label}</SelectLabel>}
              {fonts.map(font => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
};

