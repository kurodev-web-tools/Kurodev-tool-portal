import React, { useRef } from 'react';
import { Rnd, DraggableData, ResizableDelta, Position } from 'react-rnd';
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
  onDragStop: (e: MouseEvent | TouchEvent, data: DraggableData) => void;
  onResizeStop: (
    e: MouseEvent | TouchEvent,
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
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
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
      <p ref={nodeRef} className={cn("cursor-move", className)} style={{ color, fontSize, lineHeight: 1 }}>
        {text}
      </p>
    </Rnd>
  );
};

export default ThumbnailText;