import React, { useState, useEffect } from 'react';
import { Rnd, RndDragCallback, ResizableDelta, Position } from 'react-rnd';
import { ShapeType } from '../contexts/TemplateContext';
import { cn } from '@/lib/utils';

interface ThumbnailShapeProps {
  shapeType: ShapeType;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  onDragStop: RndDragCallback;
  onResize: (e: MouseEvent | TouchEvent, dir: string, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  onResizeStop: (e: MouseEvent | TouchEvent, dir: string, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  lockAspectRatio: boolean;
  enableResizing: boolean;
  disableDragging: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

const ThumbnailShape: React.FC<ThumbnailShapeProps> = ({
  shapeType,
  backgroundColor,
  borderColor,
  borderWidth,
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
  const [position, setPosition] = useState({ x: x || 0, y: y || 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setPosition({ x: x || 0, y: y || 0 });
  }, [x, y]);

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
              y1={height / 2}
              x2={width}
              y2={height / 2}
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
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="0"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={borderColor} />
              </marker>
            </defs>
            <line
              x1={0}
              y1={height / 2}
              x2={width - 10} // Adjust for arrowhead size
              y2={height / 2}
              stroke={borderColor}
              strokeWidth={borderWidth}
              markerEnd="url(#arrowhead)"
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
    <Rnd
      size={{ width, height }}
      position={position}
      onDrag={(e, d) => setPosition({ x: d.x, y: d.y })}
      onDragStop={onDragStop}
      onResize={onResize}
      onResizeStop={onResizeStop}
      lockAspectRatio={lockAspectRatio}
      enableResizing={enableResizing}
      disableDragging={disableDragging}
      bounds="parent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(isHovered && 'border border-dashed border-gray-500')}
    >
      {renderShape()}
    </Rnd>
  );
};

export default ThumbnailShape;
