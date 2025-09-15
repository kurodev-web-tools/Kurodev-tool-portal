import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { cn } from '@/lib/utils';

interface ThumbnailTextProps {
  text: string;
  color?: string;
  fontSize?: string;
  className?: string; // classNameプロパティを追加
  // その他のスタイルプロパティ
}

const ThumbnailText: React.FC<ThumbnailTextProps> = ({ text, color = 'white', fontSize = '2rem', className }) => {
  const nodeRef = useRef(null);
  return (
    <Draggable nodeRef={nodeRef} bounds="parent">
      <p ref={nodeRef} className={cn("cursor-move", className)} style={{ color, fontSize }}>
        {text}
      </p>
    </Draggable>
  );
};

export default ThumbnailText;
