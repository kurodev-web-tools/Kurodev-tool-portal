/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react';
import { Rnd, DraggableData, ResizableDelta, Position } from 'react-rnd'; // Added DraggableData, ResizableDelta, Position
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
}) => {
  const nodeRef = useRef(null);
  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      onDragStop={(e, data) => onDragStop(e, data)}
      onResizeStop={(e, dir, ref, delta, position) => onResizeStop(e, dir, ref, delta, position)}
      bounds="parent"
      minWidth={50}
      minHeight={20}
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