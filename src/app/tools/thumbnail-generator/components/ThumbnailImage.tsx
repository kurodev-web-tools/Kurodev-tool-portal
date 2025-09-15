import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface ThumbnailImageProps {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  position: { x: number; y: number };
}

const ThumbnailImage: React.FC<ThumbnailImageProps> = ({ id, src, alt, width, height, className, position }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style: React.CSSProperties = transform ? {
    transform: `translate3d(${transform.x + position.x}px, ${transform.y + position.y}px, 0)`,
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100%',
    objectFit: 'cover',
    position: 'absolute',
  } : {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100%',
    objectFit: 'cover',
    position: 'absolute',
  };

  return (
    <img
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      src={src}
      alt={alt}
      className={cn("cursor-move", className)}
    />
  );
};

export default ThumbnailImage;