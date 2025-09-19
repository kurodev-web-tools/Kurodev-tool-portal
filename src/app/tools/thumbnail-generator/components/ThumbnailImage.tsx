/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { Rnd, ResizableDelta, Position, RndDragCallback } from 'react-rnd';
import { cn } from '@/lib/utils';
import { useTemplate } from '../contexts/TemplateContext';
import { RotateCw } from 'lucide-react';

interface ThumbnailImageProps {
  id: string;
  isSelected: boolean;
  src: string | null | undefined;
  alt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  onDragStop: RndDragCallback;
  onResize: (e: MouseEvent | TouchEvent, dir: any, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  onResizeStop: (e: MouseEvent | TouchEvent, dir: any, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => void;
  lockAspectRatio: boolean;
  enableResizing: boolean;
  disableDragging: boolean;
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  id,
  isSelected,
  src,
  alt,
  x,
  y,
  width,
  height,
  rotation,
  onDragStop,
  onResize,
  onResizeStop,
  lockAspectRatio,
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

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundImage: src ? `url(${src})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <Rnd
      ref={nodeRef}
      size={{ width, height }}
      position={position}
      onDrag={(e, d) => setPosition({ x: d.x, y: d.y })}
      onDragStop={onDragStop}
      onResize={onResize}
      onResizeStop={onResizeStop}
      lockAspectRatio={lockAspectRatio}
      enableResizing={enableResizing}
      disableDragging={disableDragging || isRotating}
      bounds="parent"
      className="border border-dashed border-transparent hover:border-gray-500 transition-colors duration-200"
    >
      <div style={{ width: '100%', height: '100%', transform: `rotate(${rotation}deg)` }}>
        <div style={imageStyle} />
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


export default React.memo(ThumbnailImage);
/* eslint-enable @typescript-eslint/no-explicit-any */