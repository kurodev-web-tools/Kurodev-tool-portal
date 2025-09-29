'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Grid3X3, 
  Eye, 
  EyeOff,
  Maximize2,
  Minimize2,
  Ruler,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResizableDelta, Position } from 'react-rnd';
import styles from './EnhancedPreview.module.css';

import { useTemplate } from '../contexts/TemplateContext';
import ThumbnailText from './ThumbnailText';
import ThumbnailImage from './ThumbnailImage';
import ThumbnailShape from './ThumbnailShape';

interface EnhancedPreviewProps {
  isShiftKeyDown: boolean;
}

export default function EnhancedPreview({ isShiftKeyDown }: EnhancedPreviewProps) {
  const {
    selectedTemplate,
    layers,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
  } = useTemplate();

  // プレビュー状態管理
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showCenterLines, setShowCenterLines] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewQuality, setPreviewQuality] = useState<'standard' | 'high'>('standard');
  
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ズーム機能
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
  }, []);

  const handleZoomChange = useCallback(([value]: number[]) => {
    setZoomLevel(value);
  }, []);

  // マウスホイールでのズーム
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.max(0.25, Math.min(4, prev + delta)));
    }
  }, []);

  // フルスクリーン機能
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // レイヤーのドラッグ＆リサイズハンドラー
  const handleLayerDragStop = useCallback((id: string, _: unknown, d: Position) => {
    updateLayer(id, { x: d.x, y: d.y });
  }, [updateLayer]);

  const handleLayerResize = useCallback((id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    updateLayer(id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
  }, [updateLayer]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleZoomReset();
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
        }
      }
      
      if (e.key === 'g') {
        e.preventDefault();
        setShowGrid(prev => !prev);
      }
      
      if (e.key === 'c') {
        e.preventDefault();
        setShowCenterLines(prev => !prev);
      }
      
      if (e.key === 's') {
        e.preventDefault();
        setShowSafeArea(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset, toggleFullscreen]);

  if (!selectedTemplate) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">テンプレートを読み込み中...</p>
      </div>
    );
  }

  const isResizable = !isShiftKeyDown;
  const isDraggable = !isShiftKeyDown;

  return (
    <div className={cn(
      "flex flex-col h-full",
      isFullscreen && styles['fullscreen-mode']
    )}>
      {/* プレビューコントロール */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">プレビュー</h3>
          
          {/* ズームコントロール */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-[120px]">
              <Slider
                value={[zoomLevel]}
                onValueChange={handleZoomChange}
                min={0.25}
                max={4}
                step={0.25}
                className="flex-1"
              />
              <span className="text-sm font-medium min-w-[40px]">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ガイドコントロール */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showGrid ? "default" : "outline"}
              onClick={() => setShowGrid(!showGrid)}
              title="グリッド表示 (G)"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={showCenterLines ? "default" : "outline"}
              onClick={() => setShowCenterLines(!showCenterLines)}
              title="中央線表示 (C)"
            >
              <Ruler className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={showSafeArea ? "default" : "outline"}
              onClick={() => setShowSafeArea(!showSafeArea)}
              title="安全エリア表示 (S)"
            >
              <Target className="h-4 w-4" />
            </Button>
          </div>

          {/* 品質設定 */}
          <div className="flex items-center gap-2">
            <Label className="text-sm">品質:</Label>
            <Button
              size="sm"
              variant={previewQuality === 'standard' ? "default" : "outline"}
              onClick={() => setPreviewQuality('standard')}
            >
              標準
            </Button>
            <Button
              size="sm"
              variant={previewQuality === 'high' ? "default" : "outline"}
              onClick={() => setPreviewQuality('high')}
            >
              高品質
            </Button>
          </div>

          {/* フルスクリーン */}
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullscreen}
            title="フルスクリーン (Ctrl+F)"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* プレビューエリア */}
      <div 
        ref={containerRef}
        className={cn(
          "flex-1 overflow-auto bg-gray-100 dark:bg-gray-900",
          isFullscreen && "h-full"
        )}
        onWheel={handleWheel}
      >
        <div className="flex items-center justify-center min-h-full p-8">
          <div
            id="thumbnail-preview"
            ref={previewRef}
            className={cn(
              "relative transition-transform duration-200 ease-in-out preview-container",
              previewQuality === 'high' && styles['transform-gpu'],
              cn("aspect-video bg-card border rounded-md shadow-lg", {
                [styles['simple-enhanced']]: selectedTemplate.id === 'template-1',
                [styles['stylish-enhanced']]: selectedTemplate.id === 'template-2',
                [styles['cute-enhanced']]: selectedTemplate.id === 'template-3',
                [styles['cool-enhanced']]: selectedTemplate.id === 'template-4',
                'bg-gray-200': selectedTemplate.id === 'template-5',
              }),
              styles['export-mode'] // エクスポート時の境界線除外
            )}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center',
              width: '1280px',
              height: '720px'
            }}
          >
            {/* テンプレート背景 */}
            {selectedTemplate.id === 'template-2' && (
              <>
                <div className={cn(styles['abstract-shape'], styles['s1'])}></div>
                <div className={cn(styles['abstract-shape'], styles['s2'])}></div>
              </>
            )}
            {selectedTemplate.id === 'template-3' && (
              <>
                <div className={styles['dot-pattern']}></div>
                <div className={cn(styles['blob'], styles['b1'])}></div>
                <div className={cn(styles['blob'], styles['b2'])}></div>
              </>
            )}
            {selectedTemplate.id === 'template-4' && (
              <>
                <div className={styles['digital-overlay']}></div>
                <div className={styles['light-ray-1']}></div>
                <div className={styles['light-ray-2']}></div>
              </>
            )}

            {/* ガイド表示 */}
            {showGrid && (
              <div className={cn("absolute inset-0 pointer-events-none", styles['grid-overlay'])}>
                <svg className="w-full h-full opacity-30">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            )}

            {showCenterLines && (
              <div className={cn("absolute inset-0 pointer-events-none", styles['center-lines'])}></div>
            )}

            {showSafeArea && (
              <div className={cn("absolute inset-0 pointer-events-none", styles['safe-area'])}></div>
            )}

            {/* レイヤー */}
            {layers.slice().reverse().map((layer) => {
              const isSelected = layer.id === selectedLayerId;

              if (layer.type === 'image') {
                return (
                  <ThumbnailImage
                    key={layer.id}
                    id={layer.id}
                    isSelected={isSelected}
                    src={layer.src || ''}
                    alt={layer.name}
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                    rotation={layer.rotation}
                    onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                    onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    lockAspectRatio={isShiftKeyDown}
                    enableResizing={isResizable}
                    disableDragging={!isDraggable}
                    onSelect={() => setSelectedLayerId(layer.id)}
                    isLocked={layer.locked}
                    isDraggable={isDraggable}
                    onRotateStart={() => {}}
                    onRotate={() => {}}
                    onRotateStop={() => {}}
                  />
                );
              } else if (layer.type === 'text') {
                return (
                  <ThumbnailText
                    key={layer.id}
                    id={layer.id}
                    isSelected={isSelected}
                    text={layer.text || ''}
                    color={layer.color || '#000000'}
                    fontSize={layer.fontSize || '1rem'}
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                    rotation={layer.rotation}
                    onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                    onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    enableResizing={isResizable}
                    disableDragging={!isDraggable}
                    onSelect={() => setSelectedLayerId(layer.id)}
                    isLocked={layer.locked}
                    isDraggable={isDraggable}
                    onRotateStart={() => {}}
                    onRotate={() => {}}
                    onRotateStop={() => {}}
                  />
                );
              } else if (layer.type === 'shape' && layer.shapeType) {
                return (
                  <ThumbnailShape
                    key={layer.id}
                    id={layer.id}
                    isSelected={isSelected}
                    shapeType={layer.shapeType}
                    backgroundColor={layer.backgroundColor || '#cccccc'}
                    borderColor={layer.borderColor || '#000000'}
                    borderWidth={layer.borderWidth || 0}
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                    rotation={layer.rotation}
                    onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                    onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    lockAspectRatio={isShiftKeyDown}
                    enableResizing={isResizable}
                    disableDragging={!isDraggable}
                    onSelect={() => setSelectedLayerId(layer.id)}
                    isLocked={layer.locked}
                    isDraggable={isDraggable}
                    onRotateStart={() => {}}
                    onRotate={() => {}}
                    onRotateStop={() => {}}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* キーボードショートカットヘルプ */}
      <div className="p-2 bg-muted text-xs text-muted-foreground border-t">
        <div className="flex items-center gap-4">
          <span>ショートカット:</span>
          <span>Ctrl + +/-: ズーム</span>
          <span>Ctrl + 0: リセット</span>
          <span>G: グリッド</span>
          <span>C: 中央線</span>
          <span>S: 安全エリア</span>
          <span>Ctrl + F: フルスクリーン</span>
        </div>
      </div>
    </div>
  );
}
