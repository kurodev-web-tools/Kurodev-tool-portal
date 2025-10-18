'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Move, 
  RotateCcw, 
  Grid3X3, 
  Maximize2, 
  Minimize2,
  Eye,
  EyeOff,
  Settings,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

/**
 * 汎用EnhancedPreview - 両ツールで共通使用できるプレビューコンポーネント
 * 
 * 特徴:
 * - propsベースの設計で柔軟性を確保
 * - テンプレート固有のスタイルを外部注入可能
 * - フルスクリーン機能をオプション化
 * - プレビュー品質設定をオプション化
 * 
 * 使用例:
 * - thumbnail-generator: テンプレート背景レンダリング、カスタムCSSクラス注入
 * - asset-creator: シンプルなレイヤー表示
 */
interface GenericEnhancedPreviewProps {
  children: React.ReactNode;
  zoom: number;
  onZoomReset: () => void;
  className?: string;
  aspectRatio?: string;
  customAspectRatio?: { width: number; height: number };
  
  // プレビュー設定の状態を外部から制御するためのprops
  showGrid?: boolean;
  setShowGrid?: (show: boolean) => void;
  showAspectGuide?: boolean;
  setShowAspectGuide?: (show: boolean) => void;
  showSafeArea?: boolean;
  setShowSafeArea?: (show: boolean) => void;
  gridSize?: number;
  setGridSize?: (size: number) => void;
  
  // フルスクリーン機能（オプション）
  enableFullscreen?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  
  // プレビュー品質設定（オプション）
  enableQualitySettings?: boolean;
  previewQuality?: 'standard' | 'high';
  onQualityChange?: (quality: 'standard' | 'high') => void;
  
  // カスタムスタイル（オプション）
  customPreviewStyle?: React.CSSProperties;
  customPreviewClassName?: string;
  
  // テンプレート固有の背景レンダリング（オプション）
  renderTemplateBackground?: () => React.ReactNode;
  
  // モバイル情報表示（オプション）
  enableMobileInfo?: boolean;
  showMobileInfo?: boolean;
  onToggleMobileInfo?: () => void;
}

export const GenericEnhancedPreview: React.FC<GenericEnhancedPreviewProps> = ({
  children,
  zoom,
  onZoomReset,
  className,
  aspectRatio = '16:9',
  customAspectRatio = { width: 16, height: 9 },
  
  // プレビュー設定
  showGrid = false,
  setShowGrid,
  showAspectGuide = false,
  setShowAspectGuide,
  showSafeArea = false,
  setShowSafeArea,
  gridSize = 20,
  setGridSize,
  
  // フルスクリーン機能
  enableFullscreen = false,
  isFullscreen = false,
  onToggleFullscreen,
  
  // プレビュー品質設定
  enableQualitySettings = false,
  previewQuality = 'standard',
  onQualityChange,
  
  // カスタムスタイル
  customPreviewStyle,
  customPreviewClassName,
  
  // テンプレート固有の背景レンダリング
  renderTemplateBackground,
  
  // モバイル情報表示
  enableMobileInfo = false,
  showMobileInfo = false,
  onToggleMobileInfo,
}) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  // アスペクト比の計算
  const getAspectRatioStyle = useCallback(() => {
    if (aspectRatio === 'custom') {
      return {
        aspectRatio: `${customAspectRatio.width} / ${customAspectRatio.height}`,
      };
    }
    
    const [width, height] = aspectRatio.split(':').map(Number);
    return {
      aspectRatio: `${width} / ${height}`,
    };
  }, [aspectRatio, customAspectRatio]);
  
  // グリッドスタイルの生成
  const getGridStyle = useCallback(() => {
    if (!showGrid) return {};
    
    return {
      backgroundImage: `
        linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`,
    };
  }, [showGrid, gridSize]);
  
  // アスペクト比ガイドのスタイル
  const getAspectGuideStyle = useCallback(() => {
    if (!showAspectGuide) return {};
    
    const [width, height] = aspectRatio === 'custom' 
      ? [customAspectRatio.width, customAspectRatio.height]
      : aspectRatio.split(':').map(Number);
    
    const ratio = width / height;
    const containerRatio = 16 / 9; // デフォルトコンテナ比
    
    if (ratio > containerRatio) {
      // 横長の場合
      const guideHeight = 100 / ratio;
      return {
        position: 'absolute' as const,
        top: '50%',
        left: '0',
        right: '0',
        height: `${guideHeight}%`,
        transform: 'translateY(-50%)',
        border: '2px dashed rgba(255, 0, 0, 0.5)',
        pointerEvents: 'none' as const,
      };
    } else {
      // 縦長の場合
      const guideWidth = 100 * ratio;
      return {
        position: 'absolute' as const,
        top: '0',
        bottom: '0',
        left: '50%',
        width: `${guideWidth}%`,
        transform: 'translateX(-50%)',
        border: '2px dashed rgba(255, 0, 0, 0.5)',
        pointerEvents: 'none' as const,
      };
    }
  }, [showAspectGuide, aspectRatio, customAspectRatio]);
  
  // セーフエリアのスタイル
  const getSafeAreaStyle = useCallback(() => {
    if (!showSafeArea) return {};
    
    return {
      position: 'absolute' as const,
      top: '10%',
      left: '10%',
      right: '10%',
      bottom: '10%',
      border: '2px dashed rgba(0, 255, 0, 0.5)',
      pointerEvents: 'none' as const,
    };
  }, [showSafeArea]);
  
  return (
    <div className={cn("relative", className)}>
      {/* ツールバー */}
      <div className="flex items-center justify-between p-2 bg-white border-b">
        <div className="flex items-center gap-2">
          {/* ズームリセット */}
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomReset}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            {isDesktop ? 'リセット' : ''}
          </Button>
          
          {/* グリッド表示 */}
          {setShowGrid && (
            <div className="flex items-center gap-2">
              <Switch
                id="show-grid"
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
              <Label htmlFor="show-grid" className="text-sm">
                <Grid3X3 className="h-4 w-4" />
              </Label>
            </div>
          )}
          
          {/* アスペクト比ガイド */}
          {setShowAspectGuide && (
            <div className="flex items-center gap-2">
              <Switch
                id="show-aspect-guide"
                checked={showAspectGuide}
                onCheckedChange={setShowAspectGuide}
              />
              <Label htmlFor="show-aspect-guide" className="text-sm">
                <Move className="h-4 w-4" />
              </Label>
            </div>
          )}
          
          {/* セーフエリア */}
          {setShowSafeArea && (
            <div className="flex items-center gap-2">
              <Switch
                id="show-safe-area"
                checked={showSafeArea}
                onCheckedChange={setShowSafeArea}
              />
              <Label htmlFor="show-safe-area" className="text-sm">
                <Eye className="h-4 w-4" />
              </Label>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* フルスクリーン機能 */}
          {enableFullscreen && onToggleFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullscreen}
              className="flex items-center gap-1"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              {isDesktop ? (isFullscreen ? '終了' : 'フルスクリーン') : ''}
            </Button>
          )}
          
          {/* プレビュー品質設定 */}
          {enableQualitySettings && onQualityChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  {isDesktop ? '品質' : ''}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>プレビュー品質</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onQualityChange('standard')}
                  className={previewQuality === 'standard' ? 'bg-accent' : ''}
                >
                  標準
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onQualityChange('high')}
                  className={previewQuality === 'high' ? 'bg-accent' : ''}
                >
                  高品質
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* モバイル情報表示 */}
          {enableMobileInfo && onToggleMobileInfo && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleMobileInfo}
              className="flex items-center gap-1"
            >
              <Info className="h-4 w-4" />
              {isDesktop ? '情報' : ''}
            </Button>
          )}
        </div>
      </div>
      
      {/* プレビューエリア */}
      <div 
        className={cn(
          "relative overflow-hidden bg-gray-100",
          customPreviewClassName
        )}
        style={{
          ...getAspectRatioStyle(),
          ...getGridStyle(),
          ...customPreviewStyle,
        }}
      >
        {/* テンプレート固有の背景レンダリング */}
        {renderTemplateBackground && renderTemplateBackground()}
        
        {/* メインコンテンツ */}
        <div 
          className="relative w-full h-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {children}
        </div>
        
        {/* アスペクト比ガイド */}
        {showAspectGuide && (
          <div style={getAspectGuideStyle()} />
        )}
        
        {/* セーフエリア */}
        {showSafeArea && (
          <div style={getSafeAreaStyle()} />
        )}
      </div>
      
      {/* モバイル情報表示 */}
      {enableMobileInfo && showMobileInfo && !isDesktop && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/80 text-white p-2 rounded text-xs">
          <div className="space-y-1">
            <div>アスペクト比: {aspectRatio}</div>
            <div>ズーム: {Math.round(zoom * 100)}%</div>
            <div>グリッド: {showGrid ? 'ON' : 'OFF'}</div>
            <div>ガイド: {showAspectGuide ? 'ON' : 'OFF'}</div>
            <div>セーフエリア: {showSafeArea ? 'ON' : 'OFF'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericEnhancedPreview;


