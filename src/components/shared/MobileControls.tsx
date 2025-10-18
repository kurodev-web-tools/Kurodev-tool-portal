'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Move, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Eye,
  EyeOff,
  Plus,
  Minus
} from 'lucide-react';
import { Layer } from '@/types/layers';

/**
 * MobileControls - モバイル用レイヤー操作コントロール
 * 
 * 機能:
 * - 数値入力ボタン（位置・サイズ・回転・不透明度）
 * - スライダー（位置・サイズ・回転・不透明度）
 * - レスポンシブ対応
 * - タッチ操作に最適化
 */
interface MobileControlsProps {
  selectedLayer: Layer | null;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  className?: string;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  selectedLayer,
  onUpdateLayer,
  className
}) => {
  if (!selectedLayer) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        レイヤーを選択してください
      </div>
    );
  }

  // 数値入力ボタンのステップ値
  const POSITION_STEP = 5;
  const SIZE_STEP = 10;
  const ROTATION_STEP = 15;
  const OPACITY_STEP = 0.1;

  // 位置調整
  const handlePositionChange = (axis: 'x' | 'y', delta: number) => {
    const newValue = selectedLayer[axis] + delta;
    onUpdateLayer(selectedLayer.id, { [axis]: newValue });
  };

  // サイズ調整
  const handleSizeChange = (dimension: 'width' | 'height', delta: number) => {
    const newValue = Math.max(1, selectedLayer[dimension] + delta);
    onUpdateLayer(selectedLayer.id, { [dimension]: newValue });
  };

  // 回転調整
  const handleRotationChange = (delta: number) => {
    const newValue = selectedLayer.rotation + delta;
    onUpdateLayer(selectedLayer.id, { rotation: newValue });
  };

  // 不透明度調整
  const handleOpacityChange = (delta: number) => {
    const currentOpacity = selectedLayer.opacity || 1;
    const newValue = Math.max(0, Math.min(1, currentOpacity + delta));
    onUpdateLayer(selectedLayer.id, { opacity: newValue });
  };

  // スライダー値変更
  const handleSliderChange = (property: keyof Layer, value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    onUpdateLayer(selectedLayer.id, { [property]: numValue });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 位置調整 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Move className="h-4 w-4" />
            位置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* X座標 */}
          <div className="space-y-2">
            <Label className="text-xs">X座標</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePositionChange('x', -POSITION_STEP)}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={Math.round(selectedLayer.x)}
                onChange={(e) => onUpdateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                className="h-8 text-center text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePositionChange('x', POSITION_STEP)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Slider
              value={[selectedLayer.x]}
              onValueChange={(value) => handleSliderChange('x', value)}
              min={0}
              max={1000}
              step={1}
              className="w-full"
            />
          </div>

          {/* Y座標 */}
          <div className="space-y-2">
            <Label className="text-xs">Y座標</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePositionChange('y', -POSITION_STEP)}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={Math.round(selectedLayer.y)}
                onChange={(e) => onUpdateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                className="h-8 text-center text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePositionChange('y', POSITION_STEP)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Slider
              value={[selectedLayer.y]}
              onValueChange={(value) => handleSliderChange('y', value)}
              min={0}
              max={1000}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* サイズ調整 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Maximize2 className="h-4 w-4" />
            サイズ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 幅 */}
          <div className="space-y-2">
            <Label className="text-xs">幅</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSizeChange('width', -SIZE_STEP)}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={Math.round(selectedLayer.width)}
                onChange={(e) => onUpdateLayer(selectedLayer.id, { width: Number(e.target.value) })}
                className="h-8 text-center text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSizeChange('width', SIZE_STEP)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Slider
              value={[selectedLayer.width]}
              onValueChange={(value) => handleSliderChange('width', value)}
              min={1}
              max={500}
              step={1}
              className="w-full"
            />
          </div>

          {/* 高さ */}
          <div className="space-y-2">
            <Label className="text-xs">高さ</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSizeChange('height', -SIZE_STEP)}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={Math.round(selectedLayer.height)}
                onChange={(e) => onUpdateLayer(selectedLayer.id, { height: Number(e.target.value) })}
                className="h-8 text-center text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSizeChange('height', SIZE_STEP)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Slider
              value={[selectedLayer.height]}
              onValueChange={(value) => handleSliderChange('height', value)}
              min={1}
              max={500}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* 回転・不透明度 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            回転・不透明度
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 回転 */}
          <div className="space-y-2">
            <Label className="text-xs">回転角度</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRotationChange(-ROTATION_STEP)}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={Math.round(selectedLayer.rotation)}
                onChange={(e) => onUpdateLayer(selectedLayer.id, { rotation: Number(e.target.value) })}
                className="h-8 text-center text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRotationChange(ROTATION_STEP)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Slider
              value={[selectedLayer.rotation]}
              onValueChange={(value) => handleSliderChange('rotation', value)}
              min={-180}
              max={180}
              step={1}
              className="w-full"
            />
          </div>

          {/* 不透明度 */}
          <div className="space-y-2">
            <Label className="text-xs">不透明度</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpacityChange(-OPACITY_STEP)}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={Math.round((selectedLayer.opacity || 1) * 100)}
                onChange={(e) => onUpdateLayer(selectedLayer.id, { opacity: Number(e.target.value) / 100 })}
                className="h-8 text-center text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpacityChange(OPACITY_STEP)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Slider
              value={[(selectedLayer.opacity || 1) * 100]}
              onValueChange={(value) => onUpdateLayer(selectedLayer.id, { opacity: value[0] / 100 })}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileControls;


