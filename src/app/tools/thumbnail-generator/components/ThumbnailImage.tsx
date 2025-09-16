import React from 'react';
import { Rnd, DraggableData, ResizableDelta, Position } from 'react-rnd';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  x: number;
  y: number;
  onDragStop: (e: any, d: DraggableData) => void;
  onResizeStop: (
    e: any,
    dir: any,
    ref: HTMLDivElement,
    delta: ResizableDelta,
    position: Position
  ) => void;
  className?: string;
}

const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  alt,
  width = 300,
  height = 200,
  x,
  y,
  onDragStop,
  onResizeStop,
  className,
}) => {
  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
      bounds="parent"
    >
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        draggable="false"
      />
    </Rnd>
  );
};

export default ThumbnailImage;