'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Lock,
  Unlock,
  GripVertical,
  Type,
  Image,
  Square,
  Plus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Layer, ShapeType, isTextLayer, isImageLayer, isShapeLayer } from '@/types/layers';

// 後方互換性のためのエイリアス
export type UnifiedLayer = Layer;

// コンテキストのインターフェース
interface UnifiedLayerContext {
  layers: Layer[];
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  duplicateLayer: (id: string) => void;
  addLayer: (layer: Omit<Layer, 'id' | 'rotation' | 'zIndex'>) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
}

interface UnifiedLayerPanelProps {
  context: UnifiedLayerContext;
  onShapeSelect?: (shapeType: string) => void;
  showShapeSelector?: boolean;
  className?: string;
}

export const UnifiedLayerPanel: React.FC<UnifiedLayerPanelProps> = ({
  context,
  onShapeSelect,
  showShapeSelector = true,
  className,
}) => {
  const {
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
  } = context;

  const [showShapeSelectorModal, setShowShapeSelectorModal] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === id);
    if (layer) {
      updateLayer(id, { visible: !layer.visible });
    }
  };

  const handleToggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === id);
    if (layer) {
      updateLayer(id, { locked: !layer.locked });
    }
  };

  const handleRemoveLayer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeLayer(id);
  };

  const handleDuplicateLayer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateLayer(id);
  };

  const handleMoveLayerUp = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    moveLayerUp(id);
  };

  const handleMoveLayerDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    moveLayerDown(id);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    reorderLayers(result.source.index, result.destination.index);
  };

  const getLayerIcon = (layer: UnifiedLayer) => {
    switch (layer.type) {
      case 'text':
        return <Type className="h-4 w-4" aria-hidden="true" />;
      case 'image':
        return <Image className="h-4 w-4" aria-hidden="true" />;
      case 'shape':
        return <Square className="h-4 w-4" aria-hidden="true" />;
      default:
        return <Square className="h-4 w-4" aria-hidden="true" />;
    }
  };

  const getLayerTypeLabel = (layer: UnifiedLayer) => {
    switch (layer.type) {
      case 'text':
        return 'テキスト';
      case 'image':
        return '画像';
      case 'shape':
        return '図形';
      default:
        return 'レイヤー';
    }
  };

  // 文字列を省略する関数（最大文字数を超えた場合）
  const truncateText = (text: string, maxLength: number = 15): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const getLayerPreview = (layer: UnifiedLayer): string => {
    if (isTextLayer(layer)) {
      return truncateText(layer.text || 'テキスト', isDesktop ? 20 : 12);
    } else if (isImageLayer(layer)) {
      return truncateText(layer.name || '画像', isDesktop ? 20 : 12);
    } else if (isShapeLayer(layer)) {
      return truncateText(layer.name || '図形', isDesktop ? 20 : 12);
    }
    return 'レイヤー';
  };

  // 完全な名前を取得（title用）
  const getFullLayerName = (layer: UnifiedLayer): string => {
    if (isTextLayer(layer)) {
      return layer.text || 'テキスト';
    }
    return layer.name || 'レイヤー';
  };

  const handleAddLayer = (type: 'text' | 'image' | 'shape') => {
    const layerCount = layers.filter(l => l.type === type).length + 1;
    let name = '';
    let initialProps: Partial<UnifiedLayer> = {
      visible: true,
      locked: false,
      x: isDesktop ? 100 : 50,
      y: isDesktop ? 100 : 50,
      width: isDesktop ? 200 : 150,
      height: isDesktop ? 50 : 40,
    };

    switch (type) {
      case 'text':
        name = `テキスト${layerCount}`;
        initialProps = {
          ...initialProps,
          type: 'text',
          name,
          text: '新しいテキスト',
          color: '#000000',
          fontSize: isDesktop ? '2rem' : '1.5rem',
        };
        break;
      case 'image':
        // 画像選択ダイアログを開く
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const src = URL.createObjectURL(file);
            addLayer({
              type: 'image',
              name: file.name,
              src,
              visible: true,
              locked: false,
              x: isDesktop ? 100 : 50,
              y: isDesktop ? 100 : 50,
              width: isDesktop ? 200 : 150,
              height: isDesktop ? 150 : 120,
            } as any);
          }
        };
        input.click();
        return;
      case 'shape':
        if (showShapeSelector && onShapeSelect) {
          setShowShapeSelectorModal(true);
          return;
        }
        name = `図形${layerCount}`;
        initialProps = {
          ...initialProps,
          type: 'shape',
          name,
          shapeType: 'rectangle',
          width: isDesktop ? 100 : 80,
          height: isDesktop ? 100 : 80,
          backgroundColor: '#cccccc',
          borderColor: '#000000',
          borderWidth: 2,
        };
        break;
    }

    if (initialProps.type && initialProps.name) {
      addLayer(initialProps as Omit<UnifiedLayer, 'id' | 'rotation' | 'zIndex'>);
    }
  };

  const handleShapeSelect = (shapeType: string) => {
    setShowShapeSelectorModal(false);
    if (onShapeSelect) {
      onShapeSelect(shapeType);
    }
  };

  return (
    <div className={cn("space-y-2", className)} role="region" aria-label="レイヤー管理パネル">
      {/* レイヤー操作ボタン */}
      <div className="flex gap-1 p-2 bg-[#2D2D2D] rounded" role="group" aria-label="レイヤー追加操作">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleAddLayer('text')}
          title="テキストレイヤーを追加"
          aria-label="テキストレイヤーを追加"
        >
          <Type className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleAddLayer('image')}
          title="画像レイヤーを追加"
          aria-label="画像レイヤーを追加"
        >
          <Image className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleAddLayer('shape')}
          title="図形レイヤーを追加"
          aria-label="図形レイヤーを追加"
        >
          <Square className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => selectedLayerId && duplicateLayer(selectedLayerId)}
          disabled={!selectedLayerId}
          title="選択中のレイヤーを複製"
          aria-label="選択中のレイヤーを複製"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* レイヤー一覧 */}
      <div className="text-xs text-[#A0A0A0] px-2" role="note" aria-label="操作説明">
        ドラッグまたは↑↓ボタンで順序変更
      </div>
      <ScrollArea className="h-[35vh] lg:h-[70vh] md:h-[55vh] sm:h-[35vh]" role="region" aria-label="レイヤー一覧">
        <div className="space-y-1">
          {layers.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">レイヤーがありません</p>
              <p className="text-xs mt-1">上のボタンからレイヤーを追加してください</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="layers">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "space-y-1",
                      snapshot.isDraggingOver && "bg-blue-50 dark:bg-blue-900/20 rounded-md p-1"
                    )}
                  >
                    {layers.map((layer, index) => (
                      <Draggable key={layer.id} draggableId={layer.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded cursor-pointer transition-all duration-200",
                              selectedLayerId === layer.id
                                ? "bg-[#20B2AA]/20 border border-[#20B2AA] shadow-md"
                                : "bg-[#2D2D2D] hover:bg-[#3A3A3A]",
                              snapshot.isDragging && "shadow-lg rotate-2 scale-105",
                              !layer.visible && "opacity-50"
                            )}
                            onClick={() => setSelectedLayerId(layer.id)}
                            role="button"
                            tabIndex={0}
                            aria-label={`${getLayerTypeLabel(layer)}: ${getLayerPreview(layer)}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedLayerId(layer.id);
                              }
                            }}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                              title="ドラッグして順序変更"
                            >
                              <GripVertical className="h-4 w-4 text-[#A0A0A0]" />
                            </div>
                            
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {getLayerIcon(layer)}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {getLayerTypeLabel(layer)}
                                </div>
                                <div 
                                  className="text-xs text-[#A0A0A0] truncate" 
                                  title={getFullLayerName(layer)}
                                >
                                  {getLayerPreview(layer)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => handleMoveLayerUp(layer.id, e)}
                                disabled={index === 0}
                                title="上に移動"
                                aria-label="レイヤーを上に移動"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => handleMoveLayerDown(layer.id, e)}
                                disabled={index === layers.length - 1}
                                title="下に移動"
                                aria-label="レイヤーを下に移動"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => handleToggleVisibility(layer.id, e)}
                                title={layer.visible ? "非表示にする" : "表示する"}
                                aria-label={layer.visible ? "レイヤーを非表示にする" : "レイヤーを表示する"}
                              >
                                {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => handleToggleLock(layer.id, e)}
                                title={layer.locked ? "ロックを解除する" : "ロックする"}
                                aria-label={layer.locked ? "レイヤーのロックを解除する" : "レイヤーをロックする"}
                              >
                                {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                onClick={(e) => handleRemoveLayer(layer.id, e)}
                                title="レイヤーを削除"
                                aria-label="レイヤーを削除"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </ScrollArea>

      {/* 図形選択モーダル（必要に応じて外部から提供） */}
      {showShapeSelectorModal && onShapeSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2D2D2D] p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">図形を選択</h3>
            <div className="grid grid-cols-3 gap-3">
              {['rectangle', 'circle', 'triangle', 'line', 'arrow', 'star', 'polygon', 'heart', 'diamond'].map((shape) => (
                <Button
                  key={shape}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center"
                  onClick={() => handleShapeSelect(shape)}
                >
                  <Square className="h-6 w-6 mb-1" />
                  <span className="text-xs">{shape}</span>
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowShapeSelectorModal(false)}>
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


