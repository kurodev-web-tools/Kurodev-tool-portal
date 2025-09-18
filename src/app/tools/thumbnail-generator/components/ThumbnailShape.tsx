import React, { useState, useEffect } from 'react';
import { Rnd, RndDragCallback, ResizableDelta, Position } from 'react-rnd';
import { ShapeType } from '../contexts/TemplateContext';

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

  useEffect(() => {
    setPosition({ x: x || 0, y: y || 0 });
  }, [x, y]);

  const shapeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor,
    border: `${borderWidth}px solid ${borderColor}`,
    borderRadius: shapeType === 'circle' ? '50%' : '0',
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
    >
      <div style={shapeStyle} />
    </Rnd>
  );
};

export default ThumbnailShape;
