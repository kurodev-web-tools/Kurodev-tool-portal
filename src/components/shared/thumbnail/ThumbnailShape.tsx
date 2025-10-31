/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd, RndDragCallback, ResizableDelta, Position } from 'react-rnd';
import { cn } from '@/lib/utils';
import { RotateCw } from 'lucide-react';
import { ShapeType, Layer } from '@/types/layers';

interface ThumbnailShapeProps {
  id: string;
  isSelected: boolean;
  shapeType: ShapeType;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  rotation: number;
  zIndex?: number;
  onDragStop: RndDragCallback;
  onResize?: (e: any, dir: string, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  onResizeStop: (e: any, dir: string, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  lockAspectRatio?: boolean;
  enableResizing: boolean;
  disableDragging: boolean;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  onSelect?: () => void;
  isLocked?: boolean;
  isDraggable?: boolean;
  onRotateStart?: () => void;
  onRotate?: () => void;
  onRotateStop?: () => void;
  updateLayer?: (id: string, updates: Partial<Layer>) => void;
}

const ThumbnailShape: React.FC<ThumbnailShapeProps> = ({
  id,
  isSelected,
  shapeType,
  backgroundColor,
  borderColor,
  borderWidth,
  rotation,
  zIndex = 0,
  onDragStop,
  onResize,
  onResizeStop,
  lockAspectRatio = false,
  enableResizing,
  disableDragging,
  x,
  y,
  width,
  height,
  onSelect,
  isLocked,
  isDraggable,
  onRotateStart,
  onRotate,
  onRotateStop,
  updateLayer,
}) => {
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

  const renderShape = () => {
    const widthNum = typeof width === 'number' ? width : parseFloat(width.toString());
    const heightNum = typeof height === 'number' ? height : parseFloat(height.toString());
    
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
              y1={heightNum / 2}
              x2={widthNum}
              y2={heightNum / 2}
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
              y1={heightNum / 2}
              x2={widthNum - 10}
              y2={heightNum / 2}
              stroke={borderColor}
              strokeWidth={borderWidth}
              markerEnd={`url(#arrowhead-${id})`}
            />
          </svg>
        );
      case 'triangle':
        return (
          <svg {...commonSvgProps}>
            <polygon
              points={`${widthNum / 2},0 0,${heightNum} ${widthNum},${heightNum}`}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </svg>
        );
      case 'star':
        return (
          <svg {...commonSvgProps}>
            <polygon
              points={`${widthNum * 0.5},0 ${widthNum * 0.618},${heightNum * 0.382} ${widthNum},${heightNum * 0.382} ${widthNum * 0.691},${heightNum * 0.618} ${widthNum * 0.809},${heightNum} ${widthNum * 0.5},${heightNum * 0.764} ${widthNum * 0.191},${heightNum} ${widthNum * 0.309},${heightNum * 0.618} 0,${heightNum * 0.382} ${widthNum * 0.382},${heightNum * 0.382}`}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </svg>
        );
      case 'heart':
        return (
          <svg {...commonSvgProps}>
            <path
              d={`M${widthNum * 0.5},${heightNum * 0.9} C${widthNum * 0.5},${heightNum * 0.9} ${widthNum * 0.1},${heightNum * 0.5} ${widthNum * 0.1},${heightNum * 0.3} C${widthNum * 0.1},${heightNum * 0.15} ${widthNum * 0.25},${heightNum * 0.1} ${widthNum * 0.4},${heightNum * 0.1} C${widthNum * 0.5},${heightNum * 0.1} ${widthNum * 0.5},${heightNum * 0.2} ${widthNum * 0.5},${heightNum * 0.2} C${widthNum * 0.5},${heightNum * 0.2} ${widthNum * 0.5},${heightNum * 0.1} ${widthNum * 0.6},${heightNum * 0.1} C${widthNum * 0.75},${heightNum * 0.1} ${widthNum * 0.9},${heightNum * 0.15} ${widthNum * 0.9},${heightNum * 0.3} C${widthNum * 0.9},${heightNum * 0.5} ${widthNum * 0.5},${heightNum * 0.9} ${widthNum * 0.5},${heightNum * 0.9} Z`}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </svg>
        );
      case 'diamond':
        return (
          <svg {...commonSvgProps}>
            <polygon
              points={`${widthNum / 2},0 ${widthNum},${heightNum / 2} ${widthNum / 2},${heightNum} 0,${heightNum / 2}`}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </svg>
        );
      case 'polygon':
        return (
          <svg {...commonSvgProps}>
            <polygon
              points={`${widthNum * 0.5},0 ${widthNum * 0.9},${heightNum * 0.3} ${widthNum * 0.7},${heightNum * 0.9} ${widthNum * 0.3},${heightNum * 0.9} ${widthNum * 0.1},${heightNum * 0.3}`}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </svg>
        );
      // 装飾線
      case 'dashed-line':
        return (
          <svg {...commonSvgProps}>
            <line
              x1={0}
              y1={heightNum / 2}
              x2={widthNum}
              y2={heightNum / 2}
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeDasharray="10,5"
            />
          </svg>
        );
      case 'dotted-line':
        return (
          <svg {...commonSvgProps}>
            <line
              x1={0}
              y1={heightNum / 2}
              x2={widthNum}
              y2={heightNum / 2}
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeDasharray="2,4"
            />
          </svg>
        );
      case 'wavy-line':
        return (
          <svg {...commonSvgProps}>
            <path
              d={`M 0,${heightNum / 2} Q ${widthNum * 0.25},${heightNum * 0.2} ${widthNum * 0.5},${heightNum / 2} T ${widthNum},${heightNum / 2}`}
              fill="none"
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </svg>
        );
      // 吹き出し
      case 'speech-bubble-round':
        return (
          <svg {...commonSvgProps}>
            <path
              d={`M ${widthNum * 0.15},${heightNum * 0.1} Q ${widthNum * 0.1},${heightNum * 0.1} ${widthNum * 0.1},${heightNum * 0.15} L ${widthNum * 0.1},${heightNum * 0.7} Q ${widthNum * 0.1},${heightNum * 0.8} ${widthNum * 0.2},${heightNum * 0.8} L ${widthNum * 0.7},${heightNum * 0.8} Q ${widthNum * 0.8},${heightNum * 0.8} ${widthNum * 0.8},${heightNum * 0.7} L ${widthNum * 0.8},${heightNum * 0.15} Q ${widthNum * 0.8},${heightNum * 0.1} ${widthNum * 0.75},${heightNum * 0.1} L ${widthNum * 0.25},${heightNum * 0.1} Q ${widthNum * 0.15},${heightNum * 0.1} ${widthNum * 0.15},${heightNum * 0.1} Z M ${widthNum * 0.2},${heightNum * 0.8} L ${widthNum * 0.3},${heightNum} L ${widthNum * 0.4},${heightNum * 0.8} Z`}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </svg>
        );
      case 'speech-bubble-square':
        return (
          <svg {...commonSvgProps}>
            <path
              d={`M ${widthNum * 0.1},${heightNum * 0.1} L ${widthNum * 0.9},${heightNum * 0.1} L ${widthNum * 0.9},${heightNum * 0.7} L ${widthNum * 0.7},${heightNum * 0.7} L ${widthNum * 0.3},${heightNum} L ${widthNum * 0.4},${heightNum * 0.7} L ${widthNum * 0.1},${heightNum * 0.7} Z`}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </svg>
        );
      case 'thought-bubble':
        return (
          <svg {...commonSvgProps}>
            <ellipse
              cx={widthNum * 0.5}
              cy={heightNum * 0.4}
              rx={widthNum * 0.4}
              ry={heightNum * 0.25}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
            <circle cx={widthNum * 0.3} cy={heightNum * 0.65} r={widthNum * 0.08} fill={backgroundColor} stroke={borderColor} strokeWidth={borderWidth} />
            <circle cx={widthNum * 0.25} cy={heightNum * 0.75} r={widthNum * 0.06} fill={backgroundColor} stroke={borderColor} strokeWidth={borderWidth} />
            <circle cx={widthNum * 0.22} cy={heightNum * 0.85} r={widthNum * 0.04} fill={backgroundColor} stroke={borderColor} strokeWidth={borderWidth} />
          </svg>
        );
      // バッジ・リボン
      case 'badge':
        return (
          <svg {...commonSvgProps}>
            <path
              d={`M ${widthNum * 0.2},${heightNum * 0.1} L ${widthNum * 0.5},0 L ${widthNum * 0.8},${heightNum * 0.1} L ${widthNum * 0.9},${heightNum * 0.4} L ${widthNum * 0.8},${heightNum * 0.7} L ${widthNum * 0.5},${heightNum} L ${widthNum * 0.2},${heightNum * 0.7} L ${widthNum * 0.1},${heightNum * 0.4} Z`}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </svg>
        );
      case 'ribbon':
        return (
          <svg {...commonSvgProps}>
            <path
              d={`M ${widthNum * 0.15},${heightNum * 0.1} L ${widthNum * 0.5},${heightNum * 0.05} L ${widthNum * 0.85},${heightNum * 0.1} L ${widthNum * 0.9},${heightNum * 0.5} L ${widthNum * 0.5},${heightNum * 0.95} L ${widthNum * 0.1},${heightNum * 0.5} Z M ${widthNum * 0.2},${heightNum * 0.85} L ${widthNum * 0.15},${heightNum} L ${widthNum * 0.1},${heightNum * 0.85} Z M ${widthNum * 0.8},${heightNum * 0.85} L ${widthNum * 0.85},${heightNum} L ${widthNum * 0.9},${heightNum * 0.85} Z`}
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
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
        className="border border-dashed border-transparent hover:border-gray-500 transition-colors duration-200"
        style={{ zIndex }}
      >
        <div style={{ width: '100%', height: '100%', transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}>
          {renderShape()}
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

export default React.memo(ThumbnailShape);
/* eslint-enable @typescript-eslint/no-explicit-any */

