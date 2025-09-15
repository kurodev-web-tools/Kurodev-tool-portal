import React from 'react';
// import Image from 'next/image'; // Next.jsのImageコンポーネントは不要

interface ThumbnailImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  // その他のスタイルプロパティ
}

const ThumbnailImage: React.FC<ThumbnailImageProps> = ({ src, alt, width = 1200, height = 675 }) => { // widthとheightのデフォルト値をプレビューエリアのサイズに合わせる
  return (
    // <div style={{ position: 'absolute' }}> // position: 'absolute' は親要素で制御するため削除
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> // imgタグを使用し、スタイルでサイズを調整
    // </div>
  );
};

export default ThumbnailImage;
