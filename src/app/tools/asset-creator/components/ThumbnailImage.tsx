import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Rnd, ResizableDelta, RndDragCallback } from 'react-rnd';
import { cn } from '@/lib/utils';
import { useTemplate } from '../contexts/TemplateContext';
import { RotateCw } from 'lucide-react';
import {
  BaseThumbnailComponentProps,
  ResizeDirection,
  Position,
} from '../types/component-types';

interface ThumbnailImageProps extends Omit<BaseThumbnailComponentProps, 'onResize' | 'onResizeStop' | 'onDragStop'> {
  src: string | null | undefined;
  alt: string; // altプロパティを追加（アクセシビリティ用）
  onDragStop: RndDragCallback;
  onResize: (e: MouseEvent | TouchEvent, dir: ResizeDirection, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  onResizeStop: (e: MouseEvent | TouchEvent, dir: ResizeDirection, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  lockAspectRatio: boolean;
  disableDragging: boolean;
  isDraggable: boolean;
  isBackground?: boolean; // isBackgroundプロパティを追加
  width: number | string; // 型をnumber | stringに変更
  height: number | string; // 型をnumber | stringに変更
  zIndex: number; // zIndexプロパティを追加
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  id,
  isSelected,
  src,
  alt,
  x,
  y,
  width,
  height,
  rotation,
  onDragStop,
  onResize,
  onResizeStop,
  onSelect,
  isLocked,
  isDraggable,
  lockAspectRatio,
  enableResizing,
  disableDragging,
  isBackground,
  zIndex,
}) => {
  const { updateLayer } = useTemplate();
  const [position, setPosition] = useState({ x: x as number, y: y as number });
  const [isRotating, setIsRotating] = useState(false);
  const nodeRef = useRef<Rnd>(null);
  const rotateHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: x as number, y: y as number });
  }, [x, y]);

  const handleRotateStartMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRotating(true);

    const rndElement = nodeRef.current?.getSelfElement();
    if (!rndElement) return;
    const parentElement = rndElement.parentElement;
    if (!parentElement) return;

    const parentRect = parentElement.getBoundingClientRect();
    const centerX = parentRect.left + position.x + (width as number) / 2;
    const centerY = parentRect.top + position.y + (height as number) / 2;

    const handleRotating = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      updateLayer(id, { rotation: angle });
    };

    const handleRotateEnd = () => {
      setIsRotating(false);
      window.removeEventListener('mousemove', handleRotating);
      window.removeEventListener('mouseup', handleRotateEnd);
    };

    window.addEventListener('mousemove', handleRotating);
    window.addEventListener('mouseup', handleRotateEnd);
  };

  const handleRotateStartTouch = useCallback((e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRotating(true);

    const rndElement = nodeRef.current?.getSelfElement();
    if (!rndElement) return;
    const parentElement = rndElement.parentElement;
    if (!parentElement) return;

    const parentRect = parentElement.getBoundingClientRect();
    const centerX = parentRect.left + position.x + (width as number) / 2;
    const centerY = parentRect.top + position.y + (height as number) / 2;

    const handleRotating = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const dx = moveEvent.touches[0].clientX - centerX;
      const dy = moveEvent.touches[0].clientY - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      updateLayer(id, { rotation: angle });
    };

    const handleRotateEnd = () => {
      setIsRotating(false);
      window.removeEventListener('touchmove', handleRotating);
      window.removeEventListener('touchend', handleRotateEnd);
    };

    window.addEventListener('touchmove', handleRotating);
    window.addEventListener('touchend', handleRotateEnd);
  }, [id, updateLayer, position.x, position.y, width, height]);

  useEffect(() => {
    const handle = rotateHandleRef.current;
    if (handle) {
      handle.addEventListener('touchstart', handleRotateStartTouch, { passive: false });
      return () => {
        handle.removeEventListener('touchstart', handleRotateStartTouch);
      };
    }
  }, [handleRotateStartTouch]);

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundImage: src ? `url(${src})` : 'none',
    backgroundSize: 'cover', // containからcoverに変更
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <>
      <Rnd
        ref={nodeRef}
        size={isBackground ? { width: '100%', height: '100%' } : { width, height }}
        position={isBackground ? { x: 0, y: 0 } : position}
        onDragStart={() => {
          if (isRotating || isBackground) {
            return false;
          }
        }}
        onDrag={(e, d) => {
          if (!isRotating && !isBackground) {
            setPosition({ x: d.x, y: d.y });
          }
        }}
        onDragStop={onDragStop}
        onResize={onResize}
        onResizeStop={onResizeStop}
        lockAspectRatio={lockAspectRatio}
        enableResizing={isBackground ? false : enableResizing}
        disableDragging={isBackground || disableDragging || isRotating}
        className={cn(
          "border border-dashed border-transparent transition-colors duration-200",
          { "hover:border-gray-500": !isBackground && isSelected }
        )}
        onClick={onSelect}
        style={{ zIndex }}
      >
        <div style={{ width: '100%', height: '100%', transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}>
          <div style={imageStyle} title={alt} />
        </div>
      </Rnd>
      {isSelected && !isLocked && !isBackground && (
        <div
          ref={rotateHandleRef}
          onMouseDown={handleRotateStartMouse}
          className="absolute cursor-grab active:cursor-grabbing bg-white border rounded-full p-1 shadow z-50" // z-indexを高く設定
          style={{
            left: position.x + (width as number) / 2,
            top: position.y - 30,
            transform: 'translateX(-50%)',
          }}
        >
          <RotateCw className="h-4 w-4" />
        </div>
      )}
    </>
  );
};

export default React.memo(ThumbnailImage);
