'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Undo,
  Redo,
  Save,
  ZoomOut,
  ZoomIn,
  Download,
  RotateCcw,
  Move,
  Maximize,
  Minimize,
  Grid3X3,
  Ruler,
  Target,
} from "lucide-react";

interface ToolbarProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  onFitToScreen?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onDownload: (quality: 'normal' | 'high' | 'super') => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isPreviewDedicatedMode?: boolean;
  onTogglePreviewMode?: () => void;
  // グリッド・ガイド設定
  showGrid?: boolean;
  setShowGrid?: (show: boolean) => void;
  showAspectGuide?: boolean;
  setShowAspectGuide?: (show: boolean) => void;
  showSafeArea?: boolean;
  setShowSafeArea?: (show: boolean) => void;
  showCenterLines?: boolean;
  setShowCenterLines?: (show: boolean) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  zoom,
  setZoom,
  onFitToScreen,
  onUndo,
  onRedo,
  onSave,
  onDownload,
  canUndo = false,
  canRedo = false,
  isPreviewDedicatedMode = false,
  onTogglePreviewMode,
  showGrid = false,
  setShowGrid,
  showAspectGuide = false,
  setShowAspectGuide,
  showSafeArea = false,
  setShowSafeArea,
  showCenterLines = false,
  setShowCenterLines,
}) => {
  // 業界標準のズーム刻み (Adobe/Figma準拠) + 最小10%統一
  const MIN_ZOOM = 0.10; // 10%最小値
  const MAX_ZOOM = 3.0;  // 300%最大値
  const ZOOM_PRESETS = [0.10, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0];

  const getNextZoomLevel = (currentZoom: number, direction: 'in' | 'out'): number => {
    if (direction === 'in') {
      // 現在のズーム率より大きい最小のプリセットを見つける
      const nextPreset = ZOOM_PRESETS.find(preset => preset > currentZoom);
      return nextPreset || Math.min(currentZoom + 0.25, MAX_ZOOM);
    } else {
      // 現在のズーム率より小さい最大のプリセットを見つける
      const prevPreset = [...ZOOM_PRESETS].reverse().find(preset => preset < currentZoom);
      return prevPreset || Math.max(currentZoom - 0.25, MIN_ZOOM);
    }
  };

  const handleZoomIn = () => {
    setZoom(getNextZoomLevel(zoom, 'in'));
  };

  const handleZoomOut = () => {
    setZoom(getNextZoomLevel(zoom, 'out'));
  };

  const handleFitToScreen = () => {
    if (onFitToScreen) {
      onFitToScreen();
    } else {
      setZoom(1); // フォールバック
    }
  };

  // ズーム%クリックで直接入力機能（最小10%統一）
  const handleZoomPercentClick = () => {
    const currentPercent = Math.round(zoom * 100);
    const input = prompt(
      `ズーム率を入力してください (10-300%)`,
      currentPercent.toString()
    );
    
    if (input && !isNaN(Number(input))) {
      const newPercent = Number(input);
      if (newPercent >= 10 && newPercent <= 300) {
        const newZoom = newPercent / 100;
        setZoom(newZoom);
      } else {
        alert('ズーム率は10%から300%の間で入力してください。');
      }
    }
  };

  return (
    <nav 
      className="flex items-center gap-2 p-2 bg-[#2D2D2D] border-b border-[#4A4A4A]"
      role="toolbar"
      aria-label="Asset Creator ツールバー"
    >
      {/* 左側: 基本操作 */}
      <div className="flex items-center gap-1" role="group" aria-label="基本操作">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="元に戻す (Ctrl+Z)"
          aria-label="元に戻す"
          aria-keyshortcuts="Ctrl+Z"
        >
          <Undo className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="やり直し (Ctrl+Y)"
          aria-label="やり直し"
          aria-keyshortcuts="Ctrl+Y"
        >
          <Redo className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSave}
          title="保存 (Ctrl+S)"
          aria-label="保存"
          aria-keyshortcuts="Ctrl+S"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          <span className="ml-1 hidden sm:inline">保存</span>
        </Button>
      </div>

      {/* 中央: ズーム・ビュー */}
      <div className="flex items-center gap-1 mx-auto" role="group" aria-label="ズーム・ビュー操作">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          title="ズームアウト"
          aria-label="ズームアウト"
        >
          <ZoomOut className="h-4 w-4" aria-hidden="true" />
        </Button>
        <button
          className="text-sm text-[#E0E0E0] min-w-[60px] text-center hover:text-[#00D4FF] hover:bg-[#4A4A4A] rounded px-1 transition-colors cursor-pointer"
          onClick={handleZoomPercentClick}
          title="クリックしてズーム率を直接入力"
          aria-label={`現在のズーム倍率: ${Math.round(zoom * 100)}パーセント - クリックして変更`}
          type="button"
        >
          {Math.round(zoom * 100)}%
        </button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          title="ズームイン"
          aria-label="ズームイン"
        >
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleFitToScreen}
          title="画面にフィット（最適なサイズに自動調整）"
          aria-label="プレビューを画面に最適なサイズでフィット"
        >
          <span className="text-xs">画面フィット</span>
        </Button>
        {onTogglePreviewMode && (
          <Button 
            variant={isPreviewDedicatedMode ? "default" : "outline"}
            size="sm" 
            onClick={onTogglePreviewMode}
            title={isPreviewDedicatedMode ? "通常表示に戻す" : "プレビュー専用モード"}
            aria-label={isPreviewDedicatedMode ? "通常表示に戻す" : "プレビュー専用モード"}
          >
            {isPreviewDedicatedMode ? (
              <Minimize className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Maximize className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        )}
        
        {/* グリッド・ガイド設定 */}
        <Separator orientation="vertical" className="h-6" />
        {setShowGrid && (
          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            title="グリッド表示 (G)"
            aria-label={showGrid ? "グリッドを非表示" : "グリッドを表示"}
          >
            <Grid3X3 className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
        {setShowAspectGuide && (
          <Button
            variant={showAspectGuide ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAspectGuide(!showAspectGuide)}
            title="アスペクト比ガイド表示"
            aria-label={showAspectGuide ? "アスペクト比ガイドを非表示" : "アスペクト比ガイドを表示"}
          >
            <Ruler className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
        {setShowSafeArea && (
          <Button
            variant={showSafeArea ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSafeArea(!showSafeArea)}
            title="セーフエリア表示 (S)"
            aria-label={showSafeArea ? "セーフエリアを非表示" : "セーフエリアを表示"}
          >
            <Target className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
        {setShowCenterLines && (
          <Button
            variant={showCenterLines ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCenterLines(!showCenterLines)}
            title="中央線表示 (C)"
            aria-label={showCenterLines ? "中央線を非表示" : "中央線を表示"}
          >
            <Move className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* 右側: エクスポート */}
      <div className="flex items-center gap-1" role="group" aria-label="エクスポート操作">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              title="エクスポート"
              aria-label="エクスポートメニューを開く"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <Download className="h-4 w-4 mr-1" aria-hidden="true" />
              <span className="hidden sm:inline">エクスポート</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent role="menu" aria-label="エクスポート品質選択">
            <DropdownMenuItem 
              onClick={() => onDownload('normal')}
              role="menuitem"
            >
              標準品質 (720p)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDownload('high')}
              role="menuitem"
            >
              高品質 (1080p)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDownload('super')}
              role="menuitem"
            >
              超高品質 (4K)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

