/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd, ResizableDelta, RndDragCallback, Position } from 'react-rnd';
import { cn } from '@/lib/utils';
import { RotateCw } from 'lucide-react';
import { Layer } from '@/types/layers';
import { buildFilterString } from '@/utils/imageFilters';
import type { ImageFilters } from '@/utils/imageFilters';

interface ThumbnailImageProps {
  id: string;
  isSelected: boolean;
  src: string | null | undefined;
  alt: string;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  rotation: number;
  zIndex?: number;
  onDragStop: RndDragCallback;
  onResize?: (e: any, dir: string, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  onResizeStop: (e: any, dir: string, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  onSelect?: () => void;
  isLocked?: boolean;
  isDraggable?: boolean;
  lockAspectRatio?: boolean;
  enableResizing: boolean;
  disableDragging: boolean;
  isBackground?: boolean;
  onRotateStart?: () => void;
  onRotate?: () => void;
  onRotateStop?: () => void;
  updateLayer?: (id: string, updates: Partial<Layer>) => void;
  imageFilters?: ImageFilters;
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
  zIndex = 0,
  onDragStop,
  onResize,
  onResizeStop,
  onSelect,
  isLocked,
  isDraggable,
  lockAspectRatio = false,
  enableResizing,
  disableDragging,
  isBackground,
  onRotateStart,
  onRotate,
  onRotateStop,
  updateLayer,
  imageFilters,
}) => {
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
    const widthNum = typeof width === 'number' ? width : parseFloat(width.toString());
    const heightNum = typeof height === 'number' ? height : parseFloat(height.toString());
    const centerX = parentRect.left + position.x + widthNum / 2;
    const centerY = parentRect.top + position.y + heightNum / 2;

    const handleRotating = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (updateLayer) {
        updateLayer(id, { rotation: angle });
      }
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
    const widthNum = typeof width === 'number' ? width : parseFloat(width.toString());
    const heightNum = typeof height === 'number' ? height : parseFloat(height.toString());
    const centerX = parentRect.left + position.x + widthNum / 2;
    const centerY = parentRect.top + position.y + heightNum / 2;

    const handleRotating = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const dx = moveEvent.touches[0].clientX - centerX;
      const dy = moveEvent.touches[0].clientY - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (updateLayer) {
        updateLayer(id, { rotation: angle });
      }
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
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: buildFilterString(imageFilters),
  };

  // 背景画像の場合は絶対配置の通常divとして表示
  if (isBackground) {
    return (
      <div
        className="absolute inset-0"
        style={{
          ...imageStyle,
          zIndex: zIndex,
        }}
        title={alt}
      />
    );
  }

  return (
    <>
      <Rnd
        ref={nodeRef}
        size={{ width, height }}
        position={position}
        onDragStart={() => {
          if (isRotating) {
            return false;
          }
          // ドラッグ開始時にレイヤーを選択状態にする
          onSelect?.();
        }}
        onDrag={(e, d) => {
          if (!isRotating) {
            setPosition({ x: d.x, y: d.y });
          }
        }}
        onDragStop={onDragStop}
        onResize={onResize}
        onResizeStop={onResizeStop}
        lockAspectRatio={lockAspectRatio}
        enableResizing={enableResizing}
        disableDragging={disableDragging || isRotating}
        className={cn(
          "border border-dashed border-transparent transition-colors duration-200",
          { "hover:border-gray-500": isSelected }
        )}
        onClick={onSelect}
        style={{ zIndex }}
      >
        <div style={{ width: '100%', height: '100%', transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}>
          <div style={imageStyle} title={alt} />
        </div>
      </Rnd>
      {isSelected && !isLocked && (
        <div
          ref={rotateHandleRef}
          onMouseDown={handleRotateStartMouse}
          className="absolute cursor-grab active:cursor-grabbing bg-white border rounded-full p-1 shadow z-50"
          style={{
            left: typeof width === 'number' ? position.x + width / 2 : position.x + parseFloat(width.toString()) / 2,
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
/* eslint-enable @typescript-eslint/no-explicit-any */

