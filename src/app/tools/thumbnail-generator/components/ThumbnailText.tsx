import React from 'react';

interface ThumbnailTextProps {
  text: string;
  color?: string;
  fontSize?: string;
  // その他のスタイルプロパティ
}

const ThumbnailText: React.FC<ThumbnailTextProps> = ({ text, color = 'white', fontSize = '2rem' }) => {
  return (
    <p style={{ color, fontSize, position: 'absolute' }}>
      {text}
    </p>
  );
};

export default ThumbnailText;
