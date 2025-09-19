/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useEffect } from 'react';
import { Rnd, DraggableData, ResizableDelta, Position } from 'react-rnd';
import { cn } from '@/lib/utils';
import { useTemplate } from '../contexts/TemplateContext';
import { RotateCw } from 'lucide-react';

interface ThumbnailTextProps {
  id: string;
  isSelected: boolean;
  text: string;
  color?: string;
  fontSize?: string;
  className?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
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
  id,
  isSelected,
  text,
  color = 'white',
  fontSize = '2rem',
  className,
  x,
  y,
  width,
  height,
  rotation,
  onDragStop,
  onResizeStop,
  enableResizing,
  disableDragging,
}) => {
  const { updateLayer } = useTemplate();
  const [position, setPosition] = useState({ x, y });
  const [isRotating, setIsRotating] = useState(false);
  const nodeRef = useRef<Rnd>(null);

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleRotateStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRotating(true);

    const rndElement = nodeRef.current?.getSelfElement();
    if (!rndElement) return;

    const rect = rndElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleRotating = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      updateLayer(id, { rotation: angle });
    };

    const handleRotateEnd = () => {
      setIsRotating(false);
      window.removeEventListener('mousemove', handleRotating);
      window.removeEventListener('mouseup', handleRotateEnd);
    };

    window.addEventListener('mousemove', handleRotating);
    window.addEventListener('mouseup', handleRotateEnd);
  };

  return (
    <Rnd
      ref={nodeRef}
      size={{ width, height }}
      position={position}
      onDrag={(e, d) => setPosition({ x: d.x, y: d.y })}
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
      bounds="parent"
      minWidth={50}
      minHeight={20}
      enableResizing={enableResizing}
      disableDragging={disableDragging || isRotating}
      className="border border-dashed border-transparent hover:border-gray-500 transition-colors duration-200"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <p className={cn("cursor-move", className)} style={{ color, fontSize, lineHeight: 1, whiteSpace: 'pre-wrap' }}>
          {text}
        </p>
      </div>
      {isSelected && (
        <div
          onMouseDown={handleRotateStart}
          className="absolute -top-6 left-1/2 -translate-x-1/2 cursor-grab bg-white border rounded-full p-1 shadow z-10"
        >
          <RotateCw className="h-4 w-4" />
        </div>
      )}
    </Rnd>
  );
};

export default React.memo(ThumbnailText);
/* eslint-enable @typescript-eslint/no-explicit-any */