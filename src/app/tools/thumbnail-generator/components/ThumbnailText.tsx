import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface ThumbnailTextProps {
  id: string;
  text: string;
  color?: string;
  fontSize?: string;
  className?: string;
  position: { x: number; y: number };
}

const ThumbnailText: React.FC<ThumbnailTextProps> = ({ id, text, color = 'white', fontSize = '2rem', className, position }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x + position.x}px, ${transform.y + position.y}px, 0)`,
    color,
    fontSize,
  } : {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    color,
    fontSize,
  };

  return (
    <p ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn("cursor-move", className)}>
      {text}
    </p>
  );
};

export default ThumbnailText;