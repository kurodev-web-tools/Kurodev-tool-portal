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
import { useTemplate } from '../contexts/TemplateContext';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface EnhancedPreviewProps {
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
}

export const EnhancedPreview: React.FC<EnhancedPreviewProps> = ({
  children,
  zoom,
  onZoomReset,
  className,
  aspectRatio: propAspectRatio,
  customAspectRatio: propCustomAspectRatio,
  showGrid: propShowGrid,
  setShowGrid: propSetShowGrid,
  showAspectGuide: propShowAspectGuide,
  setShowAspectGuide: propSetShowAspectGuide,
  showSafeArea: propShowSafeArea,
  setShowSafeArea: propSetShowSafeArea,
  gridSize: propGridSize,
  setGridSize: propSetGridSize,
}) => {
  // propsから取得するか、useTemplateから取得するかを選択
  let aspectRatio: string;
  let customAspectRatio: { width: number; height: number };
  
  try {
    const templateContext = useTemplate();
    aspectRatio = propAspectRatio || templateContext.aspectRatio;
    customAspectRatio = propCustomAspectRatio || templateContext.customAspectRatio;
  } catch {
    // TemplateProviderが利用できない場合はpropsまたはデフォルト値を使用
    aspectRatio = propAspectRatio || '16:9';
    customAspectRatio = propCustomAspectRatio || { width: 16, height: 9 };
  }
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  // プレビュー設定の状態（propsが提供されていない場合は内部状態を使用）
  const [internalShowGrid, setInternalShowGrid] = useState(false);
  const [internalShowAspectGuide, setInternalShowAspectGuide] = useState(true);
  const [internalShowSafeArea, setInternalShowSafeArea] = useState(false);
  const [internalGridSize, setInternalGridSize] = useState(20);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  // propsまたは内部状態を使用
  const showGrid = propShowGrid ?? internalShowGrid;
  const setShowGrid = propSetShowGrid ?? setInternalShowGrid;
  const showAspectGuide = propShowAspectGuide ?? internalShowAspectGuide;
  const setShowAspectGuide = propSetShowAspectGuide ?? setInternalShowAspectGuide;
  const showSafeArea = propShowSafeArea ?? internalShowSafeArea;
  const setShowSafeArea = propSetShowSafeArea ?? setInternalShowSafeArea;
  const gridSize = propGridSize ?? internalGridSize;
  const setGridSize = propSetGridSize ?? setInternalGridSize;

  // アスペクト比の計算
  const currentAspectRatio = aspectRatio === 'custom' 
    ? customAspectRatio.width / customAspectRatio.height 
    : parseFloat(aspectRatio.replace(':', '/'));

  // グリッドスタイルの生成
  const gridStyle = {
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`,
  };

  // セーフエリアのスタイル（10%マージン）
  const safeAreaStyle = {
    position: 'absolute' as const,
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '10%',
    border: '2px dashed rgba(34, 197, 94, 0.6)',
    borderRadius: '4px',
    pointerEvents: 'none' as const,
  };

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  return (
    <div className={cn(
      "relative w-full h-full",
      isFullscreen && "fixed inset-4 z-50 rounded-xl shadow-2xl bg-gray-900",
      className
    )}>
      {/* グリッドオーバーレイ */}
      {showGrid && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={gridStyle}
          aria-hidden="true"
        />
      )}

            {/* プレビューエリア内の設定ボタンと情報表示 - 完全に削除 */}

      {/* アスペクト比ガイド */}
      {showAspectGuide && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="border-2 border-dashed border-blue-400/60 bg-blue-400/5 rounded"
            style={{
              width: currentAspectRatio >= 1 ? '90%' : `${90 / currentAspectRatio}%`,
              height: currentAspectRatio >= 1 ? `${90 / currentAspectRatio}%` : '90%',
              aspectRatio: currentAspectRatio,
            }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* セーフエリアガイド */}
      {showSafeArea && (
        <div style={safeAreaStyle} aria-hidden="true">
          <div className="absolute -top-6 left-0 text-xs text-green-400 font-medium">
            セーフエリア
          </div>
        </div>
      )}

      {/* メインコンテンツエリア */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-in-out'
        }}
      >
        {children}
      </div>

      {/* プレビューコントロール（デスクトップのみ表示） */}
      {isDesktop && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* 設定メニュー */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700/90"
                aria-label="プレビュー設定"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>プレビュー設定</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* グリッド表示 */}
              <DropdownMenuItem 
                className="flex items-center justify-between cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  <span>グリッド表示</span>
                </div>
                <Switch
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                  size="sm"
                />
              </DropdownMenuItem>

              {/* アスペクト比ガイド */}
              <DropdownMenuItem 
                className="flex items-center justify-between cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-2">
                  <Maximize2 className="h-4 w-4" />
                  <span>アスペクト比ガイド</span>
                </div>
                <Switch
                  checked={showAspectGuide}
                  onCheckedChange={setShowAspectGuide}
                  size="sm"
                />
              </DropdownMenuItem>

              {/* セーフエリア */}
              <DropdownMenuItem 
                className="flex items-center justify-between cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>セーフエリア</span>
                </div>
                <Switch
                  checked={showSafeArea}
                  onCheckedChange={setShowSafeArea}
                  size="sm"
                />
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* グリッドサイズ */}
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setGridSize(gridSize === 20 ? 10 : gridSize === 10 ? 40 : 20)}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                グリッドサイズ: {gridSize}px
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ズームリセット */}
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700/90"
            onClick={onZoomReset}
            title="ズームリセット (Ctrl+0)"
            aria-label="ズームを100%にリセット"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* フルスクリーン切り替え */}
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700/90"
            onClick={handleFullscreenToggle}
            title={isFullscreen ? "フルスクリーン終了 (Esc)" : "フルスクリーン表示 (F11)"}
            aria-label={isFullscreen ? "フルスクリーン終了" : "フルスクリーン表示"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* フルスクリーン時の閉じるボタン */}
      {isFullscreen && (
        <div className="absolute top-4 left-4">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700/90"
            onClick={handleFullscreenToggle}
            aria-label="フルスクリーン終了"
          >
            <Minimize2 className="h-4 w-4 mr-2" />
            終了
          </Button>
        </div>
      )}

      {/* プレビュー情報表示（デスクトップのみ） */}
      {isDesktop && (
        <div className="absolute bottom-4 left-4">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded px-3 py-1 text-xs text-gray-300">
            <div className="flex items-center gap-4">
              <span>
                {aspectRatio === 'custom' 
                  ? `${customAspectRatio.width}:${customAspectRatio.height}` 
                  : aspectRatio}
              </span>
              <span>ズーム: {Math.round(zoom * 100)}%</span>
              {showGrid && <span>グリッド: {gridSize}px</span>}
            </div>
          </div>
        </div>
      )}

      {/* キーボードショートカットのヘルプ（フルスクリーン時のみ） */}
      {isFullscreen && (
        <div className="absolute bottom-4 right-4">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded px-3 py-2 text-xs text-gray-300">
            <div className="space-y-1">
              <div><kbd className="bg-gray-700 px-1 rounded">Esc</kbd> フルスクリーン終了</div>
              <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+0</kbd> ズームリセット</div>
              <div><kbd className="bg-gray-700 px-1 rounded">G</kbd> グリッド切り替え</div>
            </div>
          </div>
        </div>
      )}

      {/* プレビューコンテンツ */}
      <div 
        className="flex items-center justify-center h-full w-full"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-in-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// キーボードショートカット用のフック
export const usePreviewKeyboardShortcuts = (
  showGrid: boolean,
  setShowGrid: (show: boolean) => void,
  onZoomReset: () => void,
  isFullscreen: boolean,
  setIsFullscreen: (fullscreen: boolean) => void
) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は無視
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'g':
        case 'G':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setShowGrid(!showGrid);
          }
          break;
        case 'Escape':
          if (isFullscreen) {
            e.preventDefault();
            setIsFullscreen(false);
          }
          break;
        case 'F11':
          e.preventDefault();
          setIsFullscreen(!isFullscreen);
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onZoomReset();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showGrid, setShowGrid, onZoomReset, isFullscreen, setIsFullscreen]);
};
