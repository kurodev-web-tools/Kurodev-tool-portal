/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Rnd, ResizableDelta, Position, RndDragCallback } from 'react-rnd';
import { cn } from '@/lib/utils';

interface ThumbnailImageProps {
  src: string | null | undefined;
  alt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onDragStop: RndDragCallback;
  onResize: (e: MouseEvent | TouchEvent, dir: any, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  onResizeStop: (e: MouseEvent | TouchEvent, dir: any, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  lockAspectRatio: boolean;
  enableResizing: boolean;
  disableDragging: boolean;
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  alt,
  x,
  y,
  width,
  height,
  onDragStop,
  onResize,
  onResizeStop,
  lockAspectRatio,
  enableResizing,
  disableDragging,
}) => {
  const [position, setPosition] = useState({ x, y });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundImage: src ? `url(${src})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
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
      <div style={imageStyle} />
    </Rnd>
  );
};


export default React.memo(ThumbnailImage);
/* eslint-enable @typescript-eslint/no-explicit-any */