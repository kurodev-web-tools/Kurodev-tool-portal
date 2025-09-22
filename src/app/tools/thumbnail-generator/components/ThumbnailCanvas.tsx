'use client';

import React from 'react';
import { ResizableDelta, Position, DraggableData } from 'react-rnd';
import { cn } from '@/lib/utils';
import { Layer } from '../types/layers';
import ThumbnailImage from './ThumbnailImage';
import ThumbnailText from './ThumbnailText';
import ThumbnailShape from './ThumbnailShape';

interface ThumbnailCanvasProps {
  selectedTemplateId: string;
  layers: Layer[];
  selectedLayerId: string | null;
  isShiftKeyDown: boolean;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  handleLayerDragStop: (id: string, e: unknown, d: Position) => void;
  handleLayerResize: (id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => void;
  onSelectLayer: (id: string) => void; // 追加
}

export function ThumbnailCanvas({
  selectedTemplateId,
  layers,
  selectedLayerId,
  isShiftKeyDown,
  updateLayer,
  handleLayerDragStop,
  handleLayerResize,
  onSelectLayer, // 追加
}: ThumbnailCanvasProps) {
  return (
    <div id="thumbnail-preview" className={cn("aspect-video w-full bg-card relative border rounded-md", {
        'simple-enhanced': selectedTemplateId === 'template-1',
        'stylish-enhanced': selectedTemplateId === 'template-2',
        'cute-enhanced': selectedTemplateId === 'template-3',
        'cool-enhanced': selectedTemplateId === 'template-4',
        'bg-gray-200': selectedTemplateId === 'template-5',
      })}>
      {selectedTemplateId === 'template-4' && (
        <>
          <div className="digital-overlay"></div>
          <div className="light-ray-1"></div>
          <div className="light-ray-2"></div>
        </>
      )}
      {layers.slice().reverse().map((layer) => {
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
              onSelect={() => onSelectLayer(layer.id)} // 追加
              isLocked={layer.locked} // 追加
              isDraggable={isDraggable} // 追加
              onRotateStart={() => {}} // 追加
              onRotate={() => {}} // 追加
              onRotateStop={() => {}} // 追加
            />
          );
        } else if (layer.type === 'text') {
          return (
            <ThumbnailText
              key={layer.id} id={layer.id} isSelected={isSelected} text={layer.text || ''} color={layer.color || '#000000'}
              fontSize={layer.fontSize || '1rem'} x={layer.x} y={layer.y} width={layer.width} height={layer.height}
              rotation={layer.rotation} onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
              onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
              enableResizing={isResizable} disableDragging={!isDraggable}
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
            />
          );
        }
        return null;
      })}
    </div>
  );
}