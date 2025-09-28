import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

// WebP対応チェック
const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// 画像URLを最適化
const optimizeImageUrl = (
  src: string, 
  width?: number, 
  height?: number, 
  quality: number = 80
): string => {
  // 外部URLの場合はそのまま返す
  if (src.startsWith('http') || src.startsWith('//')) {
    return src;
  }

  // WebP対応チェック
  const isWebPSupported = supportsWebP();
  
  // ファイル拡張子を取得
  const extension = src.split('.').pop()?.toLowerCase();
  
  // WebPがサポートされている場合はWebPに変換
  if (isWebPSupported && extension && ['jpg', 'jpeg', 'png'].includes(extension)) {
    const baseName = src.replace(/\.[^/.]+$/, '');
    const webpPath = `${baseName}.webp`;
    
    // テンプレート画像の場合はWebPを優先
    if (src.includes('/templates/')) {
      // /templates/ を /templates-webp/ に置き換え
      const webpSrc = src.replace('/templates/', '/templates-webp/');
      return webpSrc.replace(/\.[^/.]+$/, '.webp');
    }
    
    // その他の画像は元の形式を維持
    return src;
  }
  
  return src;
};

// プレースホルダー生成
const generatePlaceholder = (width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // グラデーション背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#374151');
    gradient.addColorStop(1, '#1f2937');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // パターン追加
    ctx.fillStyle = '#4b5563';
    for (let i = 0; i < width; i += 20) {
      for (let j = 0; j < height; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.fillRect(i, j, 10, 10);
        }
      }
    }
  }
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  quality = 80,
  loading = 'lazy',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // 最適化された画像URLを生成
  useEffect(() => {
    if (!src || src.trim() === '') {
      setCurrentSrc('');
      return;
    }
    const optimizedSrc = optimizeImageUrl(src, width, height, quality);
    setCurrentSrc(optimizedSrc);
  }, [src, width, height, quality]);

  // プレースホルダー生成
  const placeholderSrc = blurDataURL || (width && height ? generatePlaceholder(width, height) : '');

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    // WebPが失敗した場合は元の画像にフォールバック
    if (currentSrc.endsWith('.webp') && src !== currentSrc) {
      setCurrentSrc(src);
      setIsError(false);
    } else {
      onError?.();
    }
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{ width, height }}
    >
      {/* プレースホルダー */}
      {placeholder === 'blur' && placeholderSrc && !isLoaded && !isError && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* メイン画像 */}
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? 'eager' : loading}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
        />
      )}
      
      {/* エラー状態 */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">画像を読み込めません</div>
          </div>
        </div>
      )}
    </div>
  );
}

// レスポンシブ画像コンポーネント
interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'width' | 'height'> {
  aspectRatio?: '1:1' | '4:3' | '16:9' | '9:16' | '3:2' | '2:3';
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  style?: React.CSSProperties;
}

export function ResponsiveImage({
  aspectRatio = '16:9',
  breakpoints,
  className,
  style,
  ...props
}: ResponsiveImageProps) {
  const aspectRatioMap = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
    '3:2': 'aspect-[3/2]',
    '2:3': 'aspect-[2/3]'
  };

  // レスポンシブサイズの生成
  const generateSizes = (): string => {
    if (!breakpoints) return '100vw';
    
    const sizes = [];
    if (breakpoints.sm) sizes.push(`(max-width: 640px) ${breakpoints.sm}px`);
    if (breakpoints.md) sizes.push(`(max-width: 768px) ${breakpoints.md}px`);
    if (breakpoints.lg) sizes.push(`(max-width: 1024px) ${breakpoints.lg}px`);
    if (breakpoints.xl) sizes.push(`(max-width: 1280px) ${breakpoints.xl}px`);
    sizes.push('100vw');
    
    return sizes.join(', ');
  };

  return (
    <div className={cn("relative w-full", aspectRatioMap[aspectRatio], className)}>
      <OptimizedImage
        {...props}
        style={style}
        sizes={generateSizes()}
        className="absolute inset-0"
      />
    </div>
  );
}

// 遅延読み込み画像コンポーネント
interface LazyImageProps extends OptimizedImageProps {
  threshold?: number;
  rootMargin?: string;
}

export function LazyImage({
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={imgRef} className={props.className}>
      {isInView && <OptimizedImage {...props} />}
    </div>
  );
}
