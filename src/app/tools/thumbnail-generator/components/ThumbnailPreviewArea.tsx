/**
 * プレビューエリアコンポーネント
 * サムネイル生成ツールのメインプレビューとモバイルコントロールを提供
 */

'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Minimize2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toolbar } from '../../asset-creator/components/Toolbar';
import { EnhancedPreview } from '../../asset-creator/components/EnhancedPreview';
import ThumbnailText from '@/components/shared/thumbnail/ThumbnailText';
import ThumbnailImage from '@/components/shared/thumbnail/ThumbnailImage';
import ThumbnailShape from '@/components/shared/thumbnail/ThumbnailShape';
import { UnifiedLayerPanel } from '@/components/shared/UnifiedLayerPanel';
import { ThumbnailToolsPanel } from './ThumbnailToolsPanel';
import { Layer, ShapeType } from '@/types/layers';
import { ThumbnailEditorHandlers } from '../hooks/useThumbnailEditorHandlers';

export interface ThumbnailPreviewAreaProps {
  // UI状態
  isDesktop: boolean;
  isPreviewDedicatedMode: boolean;
  setIsPreviewDedicatedMode: (value: boolean) => void;
  isShiftKeyDown: boolean;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  
  // Preview設定
  aspectRatio: string;
  customAspectRatio: { width: number; height: number };
  zoom: number;
  setZoom: (zoom: number) => void;
  showGrid: boolean;
  setShowGrid: (value: boolean) => void;
  showAspectGuide: boolean;
  setShowAspectGuide: (value: boolean) => void;
  showSafeArea: boolean;
  setShowSafeArea: (value: boolean) => void;
  gridSize: number;
  setGridSize: (value: number) => void;
  shadowEnabled: boolean;
  setShadowEnabled: (value: boolean) => void;
  
  // Canvas
  canUndo: boolean;
  canRedo: boolean;
  
  // Layers
  layers: Layer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  duplicateLayer: (id: string) => void;
  addLayer: (layer: Omit<Layer, 'id' | 'rotation' | 'zIndex'>) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  
  // Handlers
  handlers: ThumbnailEditorHandlers;
  
  // Functions
  getPreviewSize: () => { maxWidth?: string; maxHeight?: string };
}

/**
 * サムネイル生成ツールのプレビューエリアコンポーネント
 */
export const ThumbnailPreviewArea: React.FC<ThumbnailPreviewAreaProps> = ({
  isDesktop,
  isPreviewDedicatedMode,
  setIsPreviewDedicatedMode,
  isShiftKeyDown,
  selectedTab,
  setSelectedTab,
  aspectRatio,
  customAspectRatio,
  zoom,
  setZoom,
  showGrid,
  setShowGrid,
  showAspectGuide,
  setShowAspectGuide,
  showSafeArea,
  setShowSafeArea,
  gridSize,
  setGridSize,
  shadowEnabled,
  setShadowEnabled,
  canUndo,
  canRedo,
  layers,
  selectedLayerId,
  setSelectedLayerId,
  updateLayer,
  removeLayer,
  reorderLayers,
  duplicateLayer,
  addLayer,
  moveLayerUp,
  moveLayerDown,
  handlers,
  getPreviewSize,
}) => {
  const selectedLayer = layers.find(layer => layer.id === selectedLayerId);

  const getAspectRatio = () => {
    if (aspectRatio === 'custom') {
      return `${customAspectRatio.width} / ${customAspectRatio.height}`;
    }
    return aspectRatio.replace(':', ' / ');
  };

  return (
    <>
      {/* ツールバー - デスクトップのみ表示 */}
      {isDesktop && (
        <Toolbar
          zoom={zoom}
          setZoom={setZoom}
          onUndo={handlers.handleUndo}
          onRedo={handlers.handleRedo}
          onSave={handlers.handleSave}
          onDownload={handlers.handleDownloadThumbnail}
          canUndo={canUndo}
          canRedo={canRedo}
          isPreviewDedicatedMode={isPreviewDedicatedMode}
          onTogglePreviewMode={() => setIsPreviewDedicatedMode(!isPreviewDedicatedMode)}
        />
      )}
      
      {/* モバイル表示でのフルスクリーン表示時の戻るボタン */}
      {!isDesktop && isPreviewDedicatedMode && (
        <div className="absolute top-2 left-2 z-20">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPreviewDedicatedMode(false)}
            className="bg-background/90 backdrop-blur-sm shadow-lg"
          >
            <Minimize2 className="h-4 w-4 mr-1" />
            通常表示に戻る
          </Button>
        </div>
      )}
      
      {/* プレビューエリア */}
      <div className={`${isDesktop ? 'flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 relative' : 'flex-shrink-0 bg-gray-100 dark:bg-gray-900 relative max-h-[50vh] overflow-auto'}`}>
        <div className={`${isDesktop ? 'flex items-center justify-center h-full p-4 lg:p-8' : 'flex items-center justify-center p-4'}`}>
          <EnhancedPreview
            zoom={zoom}
            onZoomReset={() => setZoom(1)}
            className="w-full"
            aspectRatio={aspectRatio}
            customAspectRatio={customAspectRatio}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            showAspectGuide={showAspectGuide}
            setShowAspectGuide={setShowAspectGuide}
            showSafeArea={showSafeArea}
            setShowSafeArea={setShowSafeArea}
            gridSize={gridSize}
            setGridSize={setGridSize}
          >
            <div
              id="thumbnail-preview"
              style={{ 
                aspectRatio: getAspectRatio(),
                ...getPreviewSize()
              }}
              className="bg-card relative border rounded-md shadow-lg"
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
                        onDragStop={(e, d) => handlers.handleLayerDragStop(layer.id, e, d)}
                        onResize={(e, dir, ref, delta, position) => handlers.handleLayerResize(layer.id, dir, ref, delta, position)}
                        onResizeStop={(e, dir, ref, delta, position) => handlers.handleLayerResize(layer.id, dir, ref, delta, position)}
                        lockAspectRatio={isShiftKeyDown}
                        enableResizing={isResizable}
                        disableDragging={!isDraggable}
                        onSelect={() => setSelectedLayerId(layer.id)}
                        isLocked={layer.locked}
                        isDraggable={isDraggable}
                        onRotateStart={() => {}}
                        onRotate={() => {}}
                        onRotateStop={() => {}}
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
                        onDragStop={(e, d) => handlers.handleLayerDragStop(layer.id, e, d)}
                        onResizeStop={(e, dir, ref, delta, position) => handlers.handleLayerResize(layer.id, dir, ref, delta, position)}
                        enableResizing={isResizable}
                        disableDragging={!isDraggable}
                        zIndex={layer.zIndex}
                        updateLayer={updateLayer}
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
                        onDragStop={(e, d) => handlers.handleLayerDragStop(layer.id, e, d)}
                        onResize={(e, dir, ref, delta, position) => handlers.handleLayerResize(layer.id, dir, ref, delta, position)}
                        onResizeStop={(e, dir, ref, delta, position) => handlers.handleLayerResize(layer.id, dir, ref, delta, position)}
                        lockAspectRatio={isShiftKeyDown}
                        enableResizing={isResizable}
                        disableDragging={!isDraggable}
                        zIndex={layer.zIndex}
                        updateLayer={updateLayer}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </EnhancedPreview>
        </div>
      </div>
    </>
  );
};

/**
 * モバイルコントロールコンポーネント
 */
export interface ThumbnailMobileControlsProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  selectedLayer: Layer | undefined;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  shadowEnabled: boolean;
  setShadowEnabled: (value: boolean) => void;
  layers: Layer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  duplicateLayer: (id: string) => void;
  addLayer: (layer: Omit<Layer, 'id' | 'rotation' | 'zIndex'>) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  handlers: ThumbnailEditorHandlers;
  setIsPreviewDedicatedMode: (value: boolean) => void;
}

export const ThumbnailMobileControls: React.FC<ThumbnailMobileControlsProps> = ({
  selectedTab,
  setSelectedTab,
  selectedLayer,
  updateLayer,
  shadowEnabled,
  setShadowEnabled,
  layers,
  selectedLayerId,
  setSelectedLayerId,
  removeLayer,
  reorderLayers,
  duplicateLayer,
  addLayer,
  moveLayerUp,
  moveLayerDown,
  handlers,
  setIsPreviewDedicatedMode,
}) => {
  return (
    <div className="p-2 lg:p-4 space-y-3">
      {/* モバイル用クイックアクション */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">クイックアクセス</h4>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="w-full h-12 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground">
            <TabsTrigger value="tools" className="flex-1">ツール設定</TabsTrigger>
            <TabsTrigger value="layers" className="flex-1">レイヤー管理</TabsTrigger>
            <TabsTrigger value="edit" className="flex-1">レイヤー編集</TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">プレビュー</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* インライン表示エリア */}
      {selectedTab === "tools" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">ツール設定</h4>
          <ThumbnailToolsPanel
            selectedLayer={selectedLayer}
            updateLayer={updateLayer}
            shadowEnabled={shadowEnabled}
            setShadowEnabled={setShadowEnabled}
          />
        </div>
      )}
      
      {selectedTab === "layers" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">レイヤー管理</h4>
          <UnifiedLayerPanel 
            context={{
              layers: layers as never[],
              updateLayer: updateLayer as never,
              removeLayer,
              selectedLayerId,
              setSelectedLayerId,
              reorderLayers,
              duplicateLayer,
              addLayer: addLayer as never,
              moveLayerUp,
              moveLayerDown,
            }}
            onShapeSelect={(shapeType) => handlers.handleAddShape(shapeType as ShapeType)}
            showShapeSelector={false}
          />
        </div>
      )}
      
      {selectedTab === "edit" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">レイヤー編集</h4>
          <ThumbnailToolsPanel
            selectedLayer={selectedLayer}
            updateLayer={updateLayer}
            shadowEnabled={shadowEnabled}
            setShadowEnabled={setShadowEnabled}
          />
        </div>
      )}
      
      {selectedTab === "preview" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">プレビュー設定</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewDedicatedMode(true)}
              className="w-full"
            >
              フルスクリーンプレビュー
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlers.handleDownloadThumbnail('high')}
              className="w-full"
            >
              ダウンロード
            </Button>
          </div>
        </div>
      )}
      
      {/* レイヤー追加ボタン */}
      <div className="space-y-2 border-t pt-3">
        <h4 className="text-sm font-medium text-muted-foreground">レイヤーを追加</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlers.handleAddText}
            className="flex items-center gap-2"
          >
            <span className="text-lg">T</span>
            <span>テキスト</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById('image-upload')?.click()}
            className="flex items-center gap-2"
          >
            <span className="text-lg">🖼️</span>
            <span>画像</span>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlers.handleAddShape('rectangle')}
            className="flex items-center gap-2"
          >
            <span className="text-lg">⬜</span>
            <span>四角</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlers.handleAddShape('circle')}
            className="flex items-center gap-2"
          >
            <span className="text-lg">⭕</span>
            <span>円</span>
          </Button>
        </div>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handlers.handleImageUpload}
          className="hidden"
          multiple
        />
      </div>
    </div>
  );
};

