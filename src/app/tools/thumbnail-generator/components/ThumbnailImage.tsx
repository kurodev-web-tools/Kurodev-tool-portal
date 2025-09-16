/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Rnd, DraggableData, ResizableDelta, Position } from 'react-rnd'; // Added DraggableData, ResizableDelta, Position
import Image from 'next/image';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  x: number;
  y: number;
  onDragStop: (e: any, data: DraggableData) => void;
  onResizeStop: (
    e: any,
    dir: string,
    ref: HTMLElement,
    delta: ResizableDelta,
    position: Position
  ) => void;
  className?: string;
}

const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  alt,
  width,
  height,
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
      onDragStop={(e, data) => onDragStop(e, data)}
      onResizeStop={(e, dir, ref, delta, position) => onResizeStop(e, dir, ref, delta, position)}
      bounds="parent"
      className="border border-dashed border-transparent hover:border-gray-500 transition-colors duration-200"
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{
          objectFit: 'cover',
        }}
        draggable="false"
      />
    </Rnd>
  );
};

export default ThumbnailImage;
/* eslint-enable @typescript-eslint/no-explicit-any */