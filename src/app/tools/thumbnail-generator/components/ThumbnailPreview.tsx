'use client';

import React from 'react';
import { toPng } from 'html-to-image';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { ResizableDelta, Position } from 'react-rnd';

import { useTemplate } from '../contexts/TemplateContext';
import ThumbnailText from '@/components/shared/thumbnail/ThumbnailText';
import ThumbnailImage from '@/components/shared/thumbnail/ThumbnailImage';
import ThumbnailShape from '@/components/shared/thumbnail/ThumbnailShape';

interface ThumbnailPreviewProps {
  isShiftKeyDown: boolean;
}

export default function ThumbnailPreview({ isShiftKeyDown }: ThumbnailPreviewProps) {
  const {
    selectedTemplate,
    layers,
    selectedLayerId,
    setSelectedLayerId, // 追加
    updateLayer,
  } = useTemplate();

  // サムネイルのダウンロード処理
  const handleDownloadThumbnail = React.useCallback(async () => {
    const thumbnailElement = document.getElementById('thumbnail-preview');
    if (thumbnailElement) {
      try {
        const dataUrl = await toPng(thumbnailElement, { cacheBust: true });
        const link = document.createElement('a');
        link.download = 'thumbnail.png';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        logger.error('サムネイル生成失敗', err, 'ThumbnailPreview');
        toast.error("画像の生成に失敗しました", {
          description: "時間をおいて再度お試しいただくか、別の画像でお試しください。",
        });
      }
    }
  }, []);

  // レイヤーのドラッグ＆リサイズハンドラー
  const handleLayerDragStop = React.useCallback((id: string, _: unknown, d: Position) => {
    updateLayer(id, { x: d.x, y: d.y });
  }, [updateLayer]);

  const handleLayerResize = React.useCallback((id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    updateLayer(id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
  }, [updateLayer]);

  if (!selectedTemplate) {
    return <div className="flex h-full items-center justify-center"><p>テンプレートを読み込み中...</p></div>;
  }

  return (
    <>
      <div id="thumbnail-preview" className={cn("aspect-video w-full bg-card relative border rounded-md", {
          'simple-enhanced': selectedTemplate.id === 'template-1',
          'stylish-enhanced': selectedTemplate.id === 'template-2',
          'cute-enhanced': selectedTemplate.id === 'template-3',
          'cool-enhanced': selectedTemplate.id === 'template-4',
          'bg-[#2D2D2D]': selectedTemplate.id === 'template-5',
        })}>
        {selectedTemplate.id === 'template-4' && (
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
                key={layer.id} id={layer.id} isSelected={isSelected} text={layer.text || ''} color={layer.color || '#000000'}
                fontSize={layer.fontSize || '1rem'} x={layer.x} y={layer.y} width={layer.width} height={layer.height}
                rotation={layer.rotation} onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                enableResizing={isResizable} disableDragging={!isDraggable}
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
      <div className="mt-4 flex justify-end">
        <Button onClick={handleDownloadThumbnail}>画像をダウンロード</Button>
      </div>
    </>
  );
}
