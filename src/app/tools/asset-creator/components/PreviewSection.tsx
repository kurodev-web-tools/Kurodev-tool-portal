'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

import ThumbnailText from '@/components/shared/thumbnail/ThumbnailText';
import ThumbnailImage from '@/components/shared/thumbnail/ThumbnailImage';
import ThumbnailShape from '@/components/shared/thumbnail/ThumbnailShape';
import { ToolbarSection } from './ToolbarSection';
import { UnifiedLayerPanel } from '@/components/shared/UnifiedLayerPanel';
import { ShapeType, Layer } from '../contexts/TemplateContext';

interface PreviewSectionProps {
  // UI状態
  isDesktop: boolean;
  isPreviewDedicatedMode: boolean;
  setIsPreviewDedicatedMode: (mode: boolean) => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  
  // プレビュー設定
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showAspectGuide: boolean;
  setShowAspectGuide: (show: boolean) => void;
  showSafeArea: boolean;
  setShowSafeArea: (show: boolean) => void;
  showCenterLines: boolean;
  setShowCenterLines: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  
  // ズーム
  zoom: number;
  setZoom: (zoom: number) => void;
  
  // レイヤー関連
  layers: Layer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  updateLayer: (id: string, updates: any) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  addLayer: (layer: Layer) => void;
  
  // アスペクト比
  aspectRatio: string;
  customAspectRatio: { width: number; height: number };
  
  // キーボード状態
  isShiftKeyDown: boolean;
  
  // イベントハンドラー
  handleLayerDragStop: (id: string, _: unknown, d: any) => void;
  handleLayerResize: (id: string, dir: string, ref: HTMLElement, delta: any, position: any) => void;
  handleToolbarUndo: () => void;
  handleToolbarRedo: () => void;
  handleSave: () => void;
  handleDownloadThumbnail: () => void;
  canUndo: boolean;
  canRedo: boolean;
  handleAddShape: (shapeType: ShapeType) => void;
  
  // ツールパネル
  renderToolsPanel: () => React.ReactNode;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  isDesktop,
  isPreviewDedicatedMode,
  setIsPreviewDedicatedMode,
  selectedTab,
  setSelectedTab,
  showGrid,
  setShowGrid,
  showAspectGuide,
  setShowAspectGuide,
  showSafeArea,
  setShowSafeArea,
  showCenterLines,
  setShowCenterLines,
  gridSize,
  setGridSize,
  zoom,
  setZoom,
  layers,
  selectedLayerId,
  setSelectedLayerId,
  updateLayer,
  removeLayer,
  duplicateLayer,
  moveLayerUp,
  moveLayerDown,
  reorderLayers,
  addLayer,
  aspectRatio,
  customAspectRatio,
  isShiftKeyDown,
  handleLayerDragStop,
  handleLayerResize,
  handleToolbarUndo,
  handleToolbarRedo,
  handleSave,
  handleDownloadThumbnail,
  canUndo,
  canRedo,
  handleAddShape,
  renderToolsPanel,
}) => {
  // プレビューのレンダリング
  const renderPreview = () => (
    <>
      <ToolbarSection
        isDesktop={isDesktop}
        isPreviewDedicatedMode={isPreviewDedicatedMode}
        setIsPreviewDedicatedMode={setIsPreviewDedicatedMode}
        zoom={zoom}
        setZoom={setZoom}
        canUndo={canUndo}
        canRedo={canRedo}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showAspectGuide={showAspectGuide}
        setShowAspectGuide={setShowAspectGuide}
        showSafeArea={showSafeArea}
        setShowSafeArea={setShowSafeArea}
        showCenterLines={showCenterLines}
        setShowCenterLines={setShowCenterLines}
        handleToolbarUndo={handleToolbarUndo}
        handleToolbarRedo={handleToolbarRedo}
        handleSave={handleSave}
        handleDownloadThumbnail={handleDownloadThumbnail}
      />
      
      {/* プレビューエリア */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 relative">
        <div className="flex items-center justify-center h-full p-4 lg:p-8">
          <div className="relative w-full h-full">
            {/* メインコンテンツエリア */}
            <div
              id="thumbnail-preview"
              style={{ 
                aspectRatio: aspectRatio === 'custom' 
                  ? `${customAspectRatio.width}/${customAspectRatio.height}` 
                  : (aspectRatio || '16:9').replace(':', '/'),
                maxWidth: '100%',
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-in-out'
              }}
              className="bg-card relative border rounded-md shadow-lg w-full"
            >
              <div id="download-target" className="w-full h-full relative overflow-hidden">
                {layers.map((layer) => {
                  const isSelected = layer.id === selectedLayerId;
                  const isDraggable = isSelected && !layer.locked;
                  const isResizable = isSelected && !layer.locked;

                  if (!layer.visible) return null;

                  if (layer.type === 'image') {
                    return (
                      <ThumbnailImage
                        key={layer.id} id={layer.id} isSelected={isSelected} src={layer.src || ''} alt={layer.name}
                        x={layer.x} y={layer.y} width={layer.width} height={layer.height} rotation={layer.rotation}
                        onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                        onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        lockAspectRatio={isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
                        onSelect={() => setSelectedLayerId(layer.id)}
                        isLocked={layer.locked}
                        isDraggable={isDraggable}
                        onRotateStart={() => {}} 
                        onRotate={() => {}} 
                        onRotateStop={() => {}}
                        isBackground={layer.isBackground}
                        zIndex={layer.zIndex}
                        updateLayer={updateLayer}
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
                        fontFamily={layer.fontFamily}
                        fontWeight={layer.fontWeight}
                        fontStyle={layer.fontStyle}
                        textDecoration={layer.textDecoration}
                        textShadow={layer.textShadow}
                        x={layer.x} 
                        y={layer.y} 
                        width={layer.width} 
                        height={layer.height}
                        rotation={layer.rotation} 
                        onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                        onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        enableResizing={isResizable} 
                        disableDragging={!isDraggable}
                        zIndex={layer.zIndex}
                        updateLayer={updateLayer}
                      />
                    );
                  } else if (layer.type === 'shape' && layer.shapeType) {
                    return (
                      <ThumbnailShape
                        key={layer.id} id={layer.id} isSelected={isSelected} shapeType={layer.shapeType}
                        backgroundColor={layer.backgroundColor || '#cccccc'} borderColor={layer.borderColor || '#000000'}
                        borderWidth={layer.borderWidth || 0} x={layer.x} y={layer.y} width={layer.width} height={layer.height}
                        rotation={layer.rotation} onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                        onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        lockAspectRatio={isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
                        zIndex={layer.zIndex}
                        updateLayer={updateLayer}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* グリッドオーバーレイ */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: `${gridSize}px ${gridSize}px`,
                }}
                aria-hidden="true"
              />
            )}

            {/* アスペクト比ガイド */}
            {showAspectGuide && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="border-2 border-dashed border-blue-400/60 bg-blue-400/5 rounded"
                  style={{
                    width: '90%',
                    height: '90%',
                    aspectRatio: aspectRatio === 'custom' 
                      ? `${customAspectRatio.width}/${customAspectRatio.height}`
                      : (aspectRatio || '16:9'),
                  }}
                  aria-hidden="true"
                />
              </div>
            )}

            {/* セーフエリアガイド */}
            {showSafeArea && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="border-2 border-dashed border-green-400/60 bg-green-400/5 rounded"
                  style={{
                    width: '80%',
                    height: '80%',
                    aspectRatio: aspectRatio === 'custom' 
                      ? `${customAspectRatio.width}/${customAspectRatio.height}`
                      : (aspectRatio || '16:9'),
                  }}
                  aria-hidden="true"
                />
              </div>
            )}

            {/* 中央線ガイド */}
            {showCenterLines && (
              <>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-px bg-red-400/60" aria-hidden="true" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-full w-px bg-red-400/60" aria-hidden="true" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // モバイル用コントロール
  const renderMobileControls = () => (
    <div className="p-2 lg:p-4 space-y-3">
      {/* モバイル用クイックアクション */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">クイックアクセス</h4>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="w-full h-12 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground">
            <TabsTrigger 
              value="tools"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              ツール設定
            </TabsTrigger>
            <TabsTrigger 
              value="layers"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              レイヤー管理
            </TabsTrigger>
            <TabsTrigger 
              value="edit"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              レイヤー編集
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="mt-4 max-h-[30vh] overflow-y-auto">
            {renderToolsPanel()}
          </TabsContent>
          
          <TabsContent value="layers" className="mt-4 max-h-[30vh] overflow-y-auto">
            <UnifiedLayerPanel 
              context={{
                layers,
                updateLayer,
                removeLayer,
                selectedLayerId,
                setSelectedLayerId,
                reorderLayers,
                duplicateLayer,
                addLayer,
                moveLayerUp,
                moveLayerDown,
              }}
              onShapeSelect={(shapeType) => handleAddShape(shapeType as ShapeType)}
              showShapeSelector={true}
            />
          </TabsContent>
          
          <TabsContent value="edit" className="mt-4 max-h-[30vh] overflow-y-auto">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">レイヤー編集</h4>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full" onClick={() => duplicateLayer(selectedLayerId!)}>
                  複製
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => removeLayer(selectedLayerId!)}>
                  削除
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => moveLayerUp(selectedLayerId!)}>
                  最前面
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => moveLayerDown(selectedLayerId!)}>
                  最背面
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  return (
    <>
      {renderPreview()}
      {!isDesktop && (
        <div className="border-t bg-background max-h-[40vh] overflow-y-auto">
          {renderMobileControls()}
        </div>
      )}
    </>
  );
};