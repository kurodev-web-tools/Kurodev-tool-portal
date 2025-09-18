/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Rnd, DraggableData, ResizableDelta, Position, RndDragCallback, RndResizeCallback, RndDragEvent } from 'react-rnd';
import Image from 'next/image';

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
  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      onDragStop={onDragStop}
      onResize={onResize}
      onResizeStop={onResizeStop}
      lockAspectRatio={lockAspectRatio}
      enableResizing={enableResizing}
      disableDragging={disableDragging}
      className="border border-dashed border-transparent hover:border-gray-500 transition-colors duration-200"
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          layout="fill"
          objectFit="cover"
          priority
        />
      )}
    </Rnd>
  );
};


export default React.memo(ThumbnailImage);
/* eslint-enable @typescript-eslint/no-explicit-any */