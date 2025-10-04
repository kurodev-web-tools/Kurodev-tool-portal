import React, { useState } from 'react';
import { useTemplate } from '../contexts/TemplateContext';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock, Unlock, Trash2, Copy, ArrowUp, ArrowDown, Type, Image, Square, Layers } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import ShapeSelectorModal, { ShapeType } from './ShapeSelectorModal';

export const LayerPanel: React.FC = () => {
  const { 
    layers, 
    updateLayer, 
    removeLayer, 
    selectedLayerId, 
    setSelectedLayerId, 
    reorderLayers, 
    duplicateLayer, 
    moveLayerUp, 
    moveLayerDown,
    addLayer 
  } = useTemplate();

  const [showShapeSelector, setShowShapeSelector] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const handleToggleVisibility = (id: string) => {
    updateLayer(id, { visible: !layers.find(layer => layer.id === id)?.visible });
  };

  const handleToggleLock = (id: string) => {
    updateLayer(id, { locked: !layers.find(layer => layer.id === id)?.locked });
  };

  const handleRemoveLayer = (id: string) => {
    removeLayer(id);
  };

  const handleDuplicateLayer = (id: string) => {
    duplicateLayer(id);
  };

  const handleAddLayer = (type: 'text' | 'image' | 'shape') => {
    const layerCount = layers.filter(l => l.type === type).length + 1;
    let name = '';
    let initialProps: any = {
      visible: true,
      locked: false,
      x: isDesktop ? 100 : 50,
      y: isDesktop ? 100 : 50,
      width: isDesktop ? 200 : 150,
      height: isDesktop ? 100 : 50,
      rotation: 0
    };

    switch (type) {
      case 'text':
        name = `テキスト ${layerCount}`;
        initialProps.text = '新しいテキスト';
        initialProps.color = '#000000';
        initialProps.fontSize = isDesktop ? '2rem' : '1rem';
        break;
      case 'image':
        name = `画像 ${layerCount}`;
        initialProps.src = '';
        // 画像レイヤー追加時にファイル選択ダイアログを表示
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const src = URL.createObjectURL(file);
            addLayer({
              type,
              name,
              ...initialProps,
              src
            });
          }
        };
        input.click();
        return; // ファイル選択後にレイヤーを追加するため、ここでreturn
      case 'shape':
        // 図形レイヤー追加時にモーダルを表示
        setShowShapeSelector(true);
        return; // モーダルで選択後にレイヤーを追加するため、ここでreturn
    }

    addLayer({
      type,
      name,
      ...initialProps
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    reorderLayers(result.source.index, result.destination.index);
  };

  const handleShapeSelect = (shapeType: ShapeType) => {
    // 図形追加はUnifiedLayerPanelのonShapeSelectで処理されるため、
    // ここでは何もしない（重複追加を防ぐ）
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4 text-blue-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-green-500" />;
      case 'shape':
        return <Square className="h-4 w-4 text-purple-500" />;
      default:
        return <Square className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLayerPreview = (layer: any) => {
    switch (layer.type) {
      case 'text':
        return layer.text?.substring(0, 20) + (layer.text?.length > 20 ? '...' : '');
      case 'image':
        return '画像';
      case 'shape':
        return layer.shapeType || '図形';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* レイヤー操作ツールバー */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {/* レイヤー追加ボタン（デスクトップのみ） */}
        {isDesktop && (
          <>
            <Button size="sm" variant="outline" onClick={() => handleAddLayer('text')}>
              <Type className="h-4 w-4 mr-1" />
              テキスト
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAddLayer('image')}>
              <Image className="h-4 w-4 mr-1" />
              画像
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAddLayer('shape')}>
              <Square className="h-4 w-4 mr-1" />
              図形
            </Button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
          </>
        )}
        
        {/* レイヤー操作ボタン（全デバイス） */}
        <Button size="sm" variant="outline" onClick={() => selectedLayerId && handleDuplicateLayer(selectedLayerId)} disabled={!selectedLayerId}>
          <Copy className="h-4 w-4 mr-1" />
          複製
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          disabled
          title="グループ化機能は近日実装予定です"
        >
          <Layers className="h-4 w-4 mr-1" />
          グループ化
        </Button>
      </div>

      {/* レイヤー一覧 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">レイヤー一覧</h3>
        <ScrollArea className="h-[400px] w-full rounded-md border p-2">
          {layers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">レイヤーがありません。</p>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="layers">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {layers.map((layer, index) => (
                      <Draggable key={layer.id} draggableId={layer.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group",
                              selectedLayerId === layer.id
                                ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                                : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700",
                              snapshot.isDragging && "shadow-lg opacity-90 bg-blue-100 dark:bg-blue-900/30"
                            )}
                            onClick={() => setSelectedLayerId(layer.id)}
                          >
                            {/* レイヤーアイコン */}
                            <div className="flex-shrink-0">
                              {getLayerIcon(layer.type)}
                            </div>

                            {/* レイヤー情報 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                  {layer.name || `${layer.type} ${index + 1}`}
                                </span>
                                {layer.locked && <Lock className="h-3 w-3 text-gray-400" />}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {getLayerPreview(layer)}
                              </div>
                            </div>

                            {/* レイヤーコントロール */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* 上下移動ボタン */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLayerUp(layer.id);
                                }}
                                disabled={index === 0}
                                title="上に移動"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLayerDown(layer.id);
                                }}
                                disabled={index === layers.length - 1}
                                title="下に移動"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              
                              {/* 既存のコントロール */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleVisibility(layer.id);
                                }}
                                title={layer.visible ? "非表示" : "表示"}
                              >
                                {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleLock(layer.id);
                                }}
                                title={layer.locked ? "ロック解除" : "ロック"}
                              >
                                {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveLayer(layer.id);
                                }}
                                title="削除"
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
        </ScrollArea>
      </div>

      {/* レイヤー統計 */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          レイヤー数: {layers.length} | 選択中: {selectedLayerId ? '1' : '0'}
        </div>
      </div>

      {/* 図形選択モーダル */}
      <ShapeSelectorModal
        isOpen={showShapeSelector}
        onClose={() => setShowShapeSelector(false)}
        onSelect={handleShapeSelect}
      />
    </div>
  );
};
