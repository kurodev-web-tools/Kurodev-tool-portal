import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd, RndDragCallback, ResizableDelta, Position } from 'react-rnd';
import { ShapeType, useTemplate } from '../contexts/TemplateContext';
import { cn } from '@/lib/utils';
import { RotateCw } from 'lucide-react';

interface ThumbnailShapeProps {
  id: string;
  isSelected: boolean;
  shapeType: ShapeType;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  rotation: number;
  zIndex: number; // zIndexプロパティを追加
  onDragStop: RndDragCallback;
  onResize: (e: MouseEvent | TouchEvent, dir: string, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  onResizeStop: (e: MouseEvent | TouchEvent, dir: string, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  lockAspectRatio: boolean;
  enableResizing: boolean;
  disableDragging: boolean;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
}

const ThumbnailShape: React.FC<ThumbnailShapeProps> = ({
  id,
  isSelected,
  shapeType,
  backgroundColor,
  borderColor,
  borderWidth,
  rotation,
  zIndex,
  onDragStop,
  onResize,
  onResizeStop,
  lockAspectRatio,
  enableResizing,
  disableDragging,
  x,
  y,
  width,
  height,
}) => {
  const { updateLayer } = useTemplate();
  const [position, setPosition] = useState({ x: x || 0, y: y || 0 });
  const [isRotating, setIsRotating] = useState(false);
  const nodeRef = useRef<Rnd>(null);
  const rotateHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: x || 0, y: y || 0 });
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
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // +90度でハンドルの初期位置を上にする
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

  const renderShape = () => {
    const commonSvgProps = {
      width: '100%',
      height: '100%',
      style: { overflow: 'visible' },
    };

    switch (shapeType) {
      case 'line':
        return (
          <svg {...commonSvgProps}>
            <line
              x1={0}
              y1={(height as number) / 2}
              x2={width as number}
              y2={(height as number) / 2}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </svg>
        );
      case 'arrow':
        return (
          <svg {...commonSvgProps}>
            <defs>
              <marker
                id={`arrowhead-${id}`}
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
                fill={borderColor}
              >
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
            </defs>
            <line
              x1={0}
              y1={(height as number) / 2}
              x2={(width as number) - 10} // 矢印の先端分短くする
              y2={(height as number) / 2}
              stroke={borderColor}
              strokeWidth={borderWidth}
              markerEnd={`url(#arrowhead-${id})`}
            />
          </svg>
        );
      case 'rectangle':
      case 'circle':
      default:
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor,
              border: `${borderWidth}px solid ${borderColor}`,
              borderRadius: shapeType === 'circle' ? '50%' : '0',
            }}
          />
        );
    }
  };

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
        className="border border-dashed border-transparent hover:border-gray-500 transition-colors duration-200"
        style={{ zIndex }}
      >
        <div style={{ width: '100%', height: '100%', transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}>
          {renderShape()}
        </div>
      </Rnd>
      {isSelected && (
        <div
          ref={rotateHandleRef}
          onMouseDown={handleRotateStartMouse}
          className="absolute cursor-grab active:cursor-grabbing bg-white border rounded-full p-1 shadow z-50"
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

export default ThumbnailShape;
