/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Rnd, RndDragCallback, ResizableDelta, Position } from 'react-rnd';
import { cn } from '@/lib/utils';
import { RotateCw } from 'lucide-react';
import { Layer } from '@/types/layers';

interface ThumbnailTextProps {
  id: string;
  isSelected: boolean;
  text: string;
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textShadow?: string;
  letterSpacing?: string;
  className?: string;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  rotation: number;
  zIndex?: number;
  onDragStop: RndDragCallback;
  onResizeStop: (
    e: any,
    dir: string,
    ref: HTMLElement,
    delta: ResizableDelta,
    position: Position
  ) => void;
  enableResizing: boolean;
  disableDragging: boolean;
  onSelect?: () => void;
  isLocked?: boolean;
  isDraggable?: boolean;
  onRotateStart?: () => void;
  onRotate?: () => void;
  onRotateStop?: () => void;
  updateLayer?: (id: string, updates: Partial<Layer>) => void;
}

const ThumbnailText: React.FC<ThumbnailTextProps> = ({
  id,
  isSelected,
  text,
  color = 'white',
  fontSize = '2rem',
  fontFamily,
  fontWeight,
  fontStyle,
  textDecoration,
  textShadow,
  letterSpacing,
  className,
  x,
  y,
  width,
  height,
  rotation,
  zIndex = 0,
  onDragStop,
  onResizeStop,
  enableResizing,
  disableDragging,
  onSelect,
  isLocked,
  isDraggable,
  onRotateStart,
  onRotate,
  onRotateStop,
  updateLayer,
}) => {
  const [position, setPosition] = useState({ x, y });
  const [isRotating, setIsRotating] = useState(false);
  const nodeRef = useRef<Rnd>(null);
  const rotateHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x, y });
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
        onResizeStop={onResizeStop}
        minWidth={50}
        minHeight={20}
        enableResizing={enableResizing}
        disableDragging={disableDragging || isRotating}
        className="border border-dashed border-transparent hover:border-gray-500 transition-colors duration-200"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: zIndex,
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}
        >
          <p 
            className={cn("cursor-move", className)} 
            style={{ 
              color, 
              fontSize, 
              fontFamily,
              fontWeight,
              fontStyle,
              textDecoration,
              textShadow,
              letterSpacing,
              lineHeight: 1, 
              whiteSpace: 'pre-wrap' 
            }}
          >
            {text}
          </p>
        </div>
      </Rnd>
      {isSelected && (
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

export default React.memo(ThumbnailText);
/* eslint-enable @typescript-eslint/no-explicit-any */

