'use client';

import React from 'react';
import { toPng } from 'html-to-image';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { ResizableDelta, Position } from 'react-rnd';

import { useTemplate, Layer } from '../contexts/TemplateContext'; // Layerをimport
import ThumbnailText from './ThumbnailText';
import ThumbnailImage from './ThumbnailImage';
import ThumbnailShape from './ThumbnailShape';

interface ThumbnailPreviewProps {
  isShiftKeyDown: boolean;
  aspectRatio: string; // 追加
  customAspectRatio: { width: number; height: number }; // 追加
}

export default function ThumbnailPreview({ isShiftKeyDown, aspectRatio, customAspectRatio }: ThumbnailPreviewProps) {
  const {
    selectedTemplate,
    layers,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
  } = useTemplate();

  const getAspectRatio = () => {
    if (aspectRatio === 'custom') {
      return `${customAspectRatio.width} / ${customAspectRatio.height}`;
    }
    return aspectRatio.replace(':', ' / ');
  };

  // サムネイルのダウンロード処理
  const handleDownloadThumbnail = React.useCallback(async () => {
    const downloadElement = document.getElementById('download-target'); // download-targetを参照
    if (downloadElement) {
      try {
        // page.tsxから移動したダウンロードロジックをここに統合
        let baseHeight: number;
        // ここでは仮に高画質をデフォルトとするか、選択肢を設ける
        baseHeight = 1080; // 例: 高画質

        let parsedAspectRatio = 16 / 9; // デフォルト
        if (aspectRatio === 'custom') {
          if (customAspectRatio.width > 0 && customAspectRatio.height > 0) {
            parsedAspectRatio = customAspectRatio.width / customAspectRatio.height;
          }
        } else {
          const [w, h] = aspectRatio.split(':').map(Number);
          if (w > 0 && h > 0) {
            parsedAspectRatio = w / h;
          }
        }

        const downloadWidth = Math.round(baseHeight * parsedAspectRatio);
        const downloadHeight = baseHeight;

        const dataUrl = await toPng(downloadElement, { 
          cacheBust: true,
          width: downloadWidth,
          height: downloadHeight,
        });
        const link = document.createElement('a');
        link.download = 'creative.png'; // ファイル名を修正
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('画像の生成に失敗しました', err);
        toast.error("画像の生成に失敗しました", {
          description: "時間をおいて再度お試しいただくか、別の画像でお試しください。",
        });
      }
    }
  }, [aspectRatio, customAspectRatio]);

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
      <div 
        id="thumbnail-preview" 
        style={{ aspectRatio: getAspectRatio() }}
        className={cn("w-full bg-card relative border rounded-md", {
          'simple-enhanced': selectedTemplate.id === 'template-1',
          'stylish-enhanced': selectedTemplate.id === 'template-2',
          'cute-enhanced': selectedTemplate.id === 'template-3',
          'cool-enhanced': selectedTemplate.id === 'template-4',
          'bg-gray-200': selectedTemplate.id === 'template-5',
        })}
      >
        <div id="download-target" className="w-full h-full relative overflow-hidden">
          {selectedTemplate.id === 'template-4' && (
            <>
              <div className="digital-overlay"></div>
              <div className="light-ray-1"></div>
              <div className="light-ray-2"></div>
            </>
          )}
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
                />
              );
            }
            return null;
          })}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleDownloadThumbnail}>画像をダウンロード</Button>
      </div>
    </>
  );
}