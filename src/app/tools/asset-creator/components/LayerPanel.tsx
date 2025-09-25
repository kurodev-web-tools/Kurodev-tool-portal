import React from 'react';
import { useTemplate } from '../contexts/TemplateContext';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export const LayerPanel: React.FC = () => {
  const { layers, updateLayer, removeLayer, selectedLayerId, setSelectedLayerId, reorderLayers, duplicateLayer, moveLayerUp, moveLayerDown } = useTemplate();

  const handleToggleVisibility = (id: string) => {
    updateLayer(id, { visible: !layers.find(layer => layer.id === id)?.visible });
  };


  const handleRemoveLayer = (id: string) => {
    removeLayer(id);
  };

  const handleDuplicateLayer = (id: string) => {
    duplicateLayer(id);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    reorderLayers(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">レイヤー</h3>
      <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-md border p-4">
        {layers.length === 0 ? (
          <p className="text-muted-foreground">レイヤーがありません。</p>
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
                          className={`flex items-center justify-between p-2 rounded-md border ${selectedLayerId === layer.id ? 'bg-accent' : 'bg-card'} ${snapshot.isDragging ? 'shadow-lg opacity-90 bg-blue-100' : ''}`}
                          onClick={() => setSelectedLayerId(layer.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate w-24">{layer.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); moveLayerUp(layer.id); }} disabled={index === 0}>
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); moveLayerDown(layer.id); }} disabled={index === layers.length - 1}>
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleToggleVisibility(layer.id); }}>
                              {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDuplicateLayer(layer.id); }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRemoveLayer(layer.id); }}>
                              <Trash2 className="h-4 w-4 text-red-500" />
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
  );
};
