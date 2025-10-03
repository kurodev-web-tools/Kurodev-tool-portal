'use client';

import React from 'react';
import { useTemplate } from '../contexts/TemplateContext';
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

export const EnhancedLayerPanel: React.FC = () => {
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
    moveLayerDown
  } = useTemplate();

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

  const getLayerIcon = (layer: any) => {
    switch (layer.type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'shape':
        return <Square className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  const getLayerTypeLabel = (layer: any) => {
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

  const getLayerPreview = (layer: any) => {
    switch (layer.type) {
      case 'text':
        return layer.text || 'テキスト';
      case 'image':
        return layer.name || '画像';
      case 'shape':
        return layer.name || '図形';
      default:
        return layer.name || 'レイヤー';
    }
  };

  return (
    <div className="space-y-2" role="region" aria-label="レイヤー管理パネル">
      {/* レイヤー操作ボタン */}
      <div className="flex gap-1 p-2 bg-gray-800 rounded" role="group" aria-label="レイヤー追加操作">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => addLayer({ 
            type: 'text', 
            name: 'テキスト', 
            text: '新しいテキスト',
            visible: true,
            locked: false,
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            color: '#000000',
            fontSize: '2rem'
          })}
          title="テキストレイヤーを追加"
          aria-label="テキストレイヤーを追加"
        >
          <Type className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => {
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
                  x: 50,
                  y: 50,
                  width: 200,
                  height: 150
                });
              }
            };
            input.click();
          }}
          title="画像レイヤーを追加"
          aria-label="画像レイヤーを追加"
        >
          <Image className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => addLayer({ 
            type: 'shape', 
            name: '図形', 
            shapeType: 'rectangle',
            visible: true,
            locked: false,
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            backgroundColor: '#cccccc',
            borderColor: '#000000',
            borderWidth: 2
          })}
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
      <div className="text-xs text-gray-400 px-2" role="note" aria-label="操作説明">
        ドラッグまたは↑↓ボタンで順序変更
      </div>
      <ScrollArea className="h-64" role="region" aria-label="レイヤー一覧">
        <div className="space-y-1">
          {layers.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">レイヤーがありません</p>
              <p className="text-xs mt-1">上のボタンからレイヤーを追加してください</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="layers">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                    {layers.map((layer, index) => (
                      <Draggable key={layer.id} draggableId={layer.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                              selectedLayerId === layer.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 hover:bg-gray-600",
                              snapshot.isDragging && "bg-blue-500 shadow-lg"
                            )}
                            onClick={() => setSelectedLayerId(layer.id)}
                          >
                            {/* ドラッグハンドル */}
                            <div 
                              {...provided.dragHandleProps} 
                              className="cursor-grab active:cursor-grabbing"
                              title="ドラッグして順序変更"
                            >
                              <GripVertical className="h-4 w-4 text-gray-400" />
                            </div>

                            {/* レイヤー情報 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {getLayerIcon(layer)}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {getLayerTypeLabel(layer)}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">
                                    {getLayerPreview(layer)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 操作ボタン */}
                            <div className="flex items-center gap-1">
                              {/* 順序変更ボタン */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => handleMoveLayerUp(layer.id, e)}
                                disabled={index === 0}
                                title="上に移動"
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
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              
                              {/* その他の操作ボタン */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => handleToggleVisibility(layer.id, e)}
                                title={layer.visible ? '非表示にする' : '表示する'}
                              >
                                {layer.visible ? (
                                  <Eye className="h-3 w-3" />
                                ) : (
                                  <EyeOff className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => handleToggleLock(layer.id, e)}
                                title={layer.locked ? 'ロックを解除' : 'ロックする'}
                              >
                                {layer.locked ? (
                                  <Lock className="h-3 w-3" />
                                ) : (
                                  <Unlock className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                onClick={(e) => handleRemoveLayer(layer.id, e)}
                                title="レイヤーを削除"
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
    </div>
  );
};
