// 画像最適化ユーティリティ
import { useState, useRef, useEffect } from 'react';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

// WebP対応チェック
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// AVIF対応チェック
export const supportsAVIF = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

// 最適な画像形式を決定
export const getOptimalFormat = (originalFormat: string): string => {
  if (typeof window === 'undefined') return originalFormat;
  
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return originalFormat;
};

// 画像URLを最適化
export const optimizeImageUrl = (
  src: string,
  options: ImageOptimizationOptions = {}
): string => {
  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    fit = 'cover'
  } = options;

  // 外部URLの場合はそのまま返す
  if (src.startsWith('http') || src.startsWith('//')) {
    return src;
  }

  // ファイル拡張子を取得
  const extension = src.split('.').pop()?.toLowerCase();
  if (!extension) return src;

  // 最適な形式を決定
  let targetFormat: string = format;
  if (format === 'auto') {
    targetFormat = getOptimalFormat(extension);
  }

  // ファイル名を生成
  const baseName = src.replace(/\.[^/.]+$/, '');
  const optimizedSrc = `${baseName}.${targetFormat}`;

  // クエリパラメータを追加（実際の画像最適化サービスを使用する場合）
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality !== 80) params.set('q', quality.toString());
  if (fit !== 'cover') params.set('fit', fit);

  const queryString = params.toString();
  return queryString ? `${optimizedSrc}?${queryString}` : optimizedSrc;
};

// レスポンシブ画像のsrcSetを生成
export const generateSrcSet = (
  baseSrc: string,
  widths: number[],
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string => {
  return widths
    .map(width => {
      const optimizedUrl = optimizeImageUrl(baseSrc, { ...options, width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

// デバイス別の最適なサイズを計算
export const getResponsiveSizes = (
  baseWidth: number,
  breakpoints: { [key: string]: number } = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  }
): string => {
  const sizes = Object.entries(breakpoints)
    .map(([breakpoint, maxWidth]) => {
      const width = Math.min(baseWidth, maxWidth);
      return `(max-width: ${maxWidth}px) ${width}px`;
    })
    .join(', ');
  
  return `${sizes}, ${baseWidth}px`;
};

// 画像のプレビュー用URLを生成
export const generatePreviewUrl = (
  src: string,
  width: number = 300,
  height: number = 200,
  quality: number = 50
): string => {
  return optimizeImageUrl(src, {
    width,
    height,
    quality,
    fit: 'cover'
  });
};

// 画像のメタデータを取得（実際の実装では画像を読み込んで取得）
export const getImageMetadata = async (src: string): Promise<{
  width: number;
  height: number;
  aspectRatio: number;
} | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

// 画像の遅延読み込み用Intersection Observer
export const createLazyImageObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '50px'
  }
): IntersectionObserver => {
  return new IntersectionObserver(callback, options);
};

// 画像のプリロード
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// 複数画像のプリロード
export const preloadImages = async (srcs: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(srcs.map(preloadImage));
};

// 画像の圧縮（クライアントサイド）
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // アスペクト比を維持しながらリサイズ
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// 画像の遅延読み込み用フック
export const useLazyImage = (
  src: string,
  options: IntersectionObserverInit = {}
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = createLazyImageObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      options
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  useEffect(() => {
    if (isInView && !isLoaded && !isError) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setIsError(true);
      img.src = src;
    }
  }, [isInView, src, isLoaded, isError]);

  return {
    imgRef,
    isLoaded,
    isInView,
    isError
  };
};
