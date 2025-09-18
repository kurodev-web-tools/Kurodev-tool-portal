/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useEffect } from 'react';
import { Rnd, DraggableData, ResizableDelta, Position, RndDragCallback } from 'react-rnd';
import { cn } from '@/lib/utils';

interface ThumbnailTextProps {
  text: string;
  color?: string;
  fontSize?: string;
  className?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onDragStop: (e: any, data: DraggableData) => void;
  onResizeStop: (
    e: any,
    dir: string,
    ref: HTMLElement,
    delta: ResizableDelta,
    position: Position
  ) => void;
  enableResizing: boolean;
  disableDragging: boolean;
}

const ThumbnailText: React.FC<ThumbnailTextProps> = ({
  text,
  color = 'white',
  fontSize = '2rem',
  className,
  x,
  y,
  width,
  height,
  onDragStop,
  onResizeStop,
  enableResizing,
  disableDragging,
}) => {
  const nodeRef = useRef(null);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  return (
    <Rnd
      size={{ width, height }}
      position={position}
      onDrag={(e, d) => setPosition({ x: d.x, y: d.y })}
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
      bounds="parent"
      minWidth={50}
      minHeight={20}
      enableResizing={enableResizing}
      disableDragging={disableDragging}
      className="border border-dashed border-transparent hover:border-gray-500 transition-colors duration-200"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p ref={nodeRef} className={cn("cursor-move", className)} style={{ color, fontSize, lineHeight: 1, whiteSpace: 'pre-wrap' }}>
        {text}
      </p>
    </Rnd>
  );
};

export default React.memo(ThumbnailText);
/* eslint-enable @typescript-eslint/no-explicit-any */