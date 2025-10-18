'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  ZoomIn, 
  ZoomOut, 
  Grid3X3, 
  Eye,
  EyeOff,
  Target,
  Ruler,
  Move,
  RotateCcw
} from 'lucide-react';

/**
 * MobileDisplaySettings - モバイル用表示設定コントロール
 * 
 * 機能:
 * - 拡大縮小スライダー + フィットボタン
 * - グリッド表示のオン/オフ + グリッドサイズ調整
 * - ガイドライン表示のオン/オフ
 * - セーフエリア表示のオン/オフ
 * - アスペクト比ガイド表示のオン/オフ
 * - モバイル表示専用
 */
interface MobileDisplaySettingsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  showGuides: boolean;
  onShowGuidesChange: (show: boolean) => void;
  showSafeArea?: boolean;
  onShowSafeAreaChange?: (show: boolean) => void;
  showAspectGuide?: boolean;
  onShowAspectGuideChange?: (show: boolean) => void;
  gridSize?: number;
  onGridSizeChange?: (size: number) => void;
  className?: string;
}

export const MobileDisplaySettings: React.FC<MobileDisplaySettingsProps> = ({
  zoom,
  onZoomChange,
  showGrid,
  onShowGridChange,
  showGuides,
  onShowGuidesChange,
  showSafeArea,
  onShowSafeAreaChange,
  showAspectGuide,
  onShowAspectGuideChange,
  gridSize = 20,
  onGridSizeChange,
  className
}) => {
  const handleZoomSliderChange = (value: number[]) => {
    onZoomChange(value[0]);
  };

  const handleZoomButton = (delta: number) => {
    const newZoom = Math.max(0.1, Math.min(3, zoom + delta));
    onZoomChange(newZoom);
  };

  const handleFitToScreen = () => {
    onZoomChange(1);
  };

  const handleGridSizeChange = (value: number[]) => {
    if (onGridSizeChange) {
      onGridSizeChange(value[0]);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="h-4 w-4" />
          表示設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 拡大縮小 */}
        <div className="space-y-2">
          <Label className="text-xs">拡大縮小</Label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoomButton(-0.1)}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <div className="flex-1">
              <Slider
                value={[zoom]}
                onValueChange={handleZoomSliderChange}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoomButton(0.1)}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {Math.round(zoom * 100)}%
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFitToScreen}
              className="h-6 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              フィット
            </Button>
          </div>
        </div>

        {/* グリッド表示 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-2">
              <Grid3X3 className="h-3 w-3" />
              グリッド表示
            </Label>
            <Switch
              checked={showGrid}
              onCheckedChange={onShowGridChange}
              size="sm"
            />
          </div>
          {showGrid && onGridSizeChange && (
            <div className="space-y-1 pl-5">
              <Label className="text-xs text-muted-foreground">グリッドサイズ</Label>
              <Slider
                value={[gridSize]}
                onValueChange={handleGridSizeChange}
                min={10}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-center text-muted-foreground">
                {gridSize}px
              </div>
            </div>
          )}
        </div>

        {/* セーフエリア表示 */}
        {onShowSafeAreaChange && (
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-2">
              <Target className="h-3 w-3" />
              セーフエリア表示
            </Label>
            <Switch
              checked={showSafeArea || false}
              onCheckedChange={onShowSafeAreaChange}
              size="sm"
            />
          </div>
        )}

        {/* アスペクト比ガイド表示 */}
        {onShowAspectGuideChange && (
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-2">
              <Ruler className="h-3 w-3" />
              アスペクト比ガイド
            </Label>
            <Switch
              checked={showAspectGuide || false}
              onCheckedChange={onShowAspectGuideChange}
              size="sm"
            />
          </div>
        )}

        {/* ガイドライン表示 */}
        <div className="flex items-center justify-between">
          <Label className="text-xs flex items-center gap-2">
            <Move className="h-3 w-3" />
            ガイドライン表示
          </Label>
          <Switch
            checked={showGuides}
            onCheckedChange={onShowGuidesChange}
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileDisplaySettings;
