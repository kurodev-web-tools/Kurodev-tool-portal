'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Square, Circle, Triangle, Minus, ArrowRight, Star, Hexagon, Heart, Diamond } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ShapeType } from '@/types/layers';

interface ShapeTypeSelectorProps {
  value: ShapeType;
  onChange: (shape: ShapeType) => void;
  className?: string;
}

/**
 * 図形タイプ選択用の共通コンポーネント
 * 
 * 9種類の図形タイプから選択できるボタングループを提供します。
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
  // 基本図形のみ（編集時は基本図形から選択）
  const shapeOptions = [
    { type: 'rectangle' as const, label: '四角形', icon: Square },
    { type: 'circle' as const, label: '円', icon: Circle },
    { type: 'triangle' as const, label: '三角形', icon: Triangle },
    { type: 'line' as const, label: '線', icon: Minus },
    { type: 'arrow' as const, label: '矢印', icon: ArrowRight },
    { type: 'star' as const, label: '星', icon: Star },
    { type: 'polygon' as const, label: '多角形', icon: Hexagon },
    { type: 'heart' as const, label: 'ハート', icon: Heart },
    { type: 'diamond' as const, label: 'ダイヤ', icon: Diamond },
    // 新しい図形タイプは表示するが、アイコンは適宜対応
    { type: 'dashed-line' as const, label: '点線', icon: Minus },
    { type: 'dotted-line' as const, label: '点線', icon: Minus },
    { type: 'wavy-line' as const, label: '波線', icon: Minus },
    { type: 'speech-bubble-round' as const, label: '吹き出し', icon: Square },
    { type: 'speech-bubble-square' as const, label: '吹き出し(角)', icon: Square },
    { type: 'thought-bubble' as const, label: '思考バブル', icon: Square },
    { type: 'badge' as const, label: 'バッジ', icon: Star },
    { type: 'ribbon' as const, label: 'リボン', icon: Heart },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)} data-testid="shape-type-selector">
      {shapeOptions.map(shape => (
        <Button
          key={shape.type}
          variant={value === shape.type ? 'default' : 'outline'}
          onClick={() => onChange(shape.type)}
          size="sm"
          className="flex items-center justify-center gap-1"
          data-testid={`shape-type-${shape.type}`}
        >
          <shape.icon className="h-4 w-4" />
          <span className="text-xs">{shape.label}</span>
        </Button>
      ))}
    </div>
  );
};

