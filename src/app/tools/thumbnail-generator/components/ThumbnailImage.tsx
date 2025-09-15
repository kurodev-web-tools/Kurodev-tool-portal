import React from 'react';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const ThumbnailImage: React.FC<ThumbnailImageProps> = ({ src, alt, width, height, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        objectFit: 'cover',
        position: 'absolute', // Draggableが担っていた位置指定をCSSで行う
      }}
    />
  );
};

export default ThumbnailImage;
