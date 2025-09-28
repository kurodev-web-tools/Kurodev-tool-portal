import { useState, useRef, useEffect } from 'react';
import { ResponsiveImage } from './optimized-image';
import { cn } from '@/lib/utils';

interface LazyImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    aspectRatio?: '1:1' | '4:3' | '16:9' | '9:16' | '3:2' | '2:3';
    priority?: boolean;
  }>;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LazyImageGallery({
  images,
  columns = 3,
  gap = 'md',
  className
}: LazyImageGalleryProps) {
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleImages(prev => new Set([...prev, index]));
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    imageRefs.current.forEach((ref, index) => {
      if (ref) {
        observerRef.current?.observe(ref);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
  };

  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {images.map((image, index) => (
        <div
          key={index}
          ref={(el) => { imageRefs.current[index] = el; }}
          data-index={index}
          className="relative group"
        >
          {/* プレースホルダー */}
          {!visibleImages.has(index) && (
            <div className={cn(
              'bg-gray-800 animate-pulse rounded-lg',
              image.aspectRatio === '1:1' ? 'aspect-square' :
              image.aspectRatio === '4:3' ? 'aspect-[4/3]' :
              image.aspectRatio === '9:16' ? 'aspect-[9/16]' :
              image.aspectRatio === '3:2' ? 'aspect-[3/2]' :
              image.aspectRatio === '2:3' ? 'aspect-[2/3]' :
              'aspect-video'
            )}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-500 text-sm">読み込み中...</div>
              </div>
            </div>
          )}

          {/* 実際の画像 */}
          {visibleImages.has(index) && (
            <div className={cn(
              'relative overflow-hidden rounded-lg transition-all duration-300',
              loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
            )}>
              <ResponsiveImage
                src={image.src}
                alt={image.alt}
                aspectRatio={image.aspectRatio || '16:9'}
                priority={image.priority}
                onLoad={() => handleImageLoad(index)}
                className="group-hover:scale-105 transition-transform duration-300"
                breakpoints={{
                  sm: 200,
                  md: 300,
                  lg: 400
                }}
              />
              
              {/* ホバーオーバーレイ */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-white text-sm font-medium">
                    {image.alt}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// 単一の遅延読み込み画像
interface LazyImageProps {
  src: string;
  alt: string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '9:16' | '3:2' | '2:3';
  className?: string;
  priority?: boolean;
}

export function LazyImage({ src, alt, aspectRatio = '16:9', className, priority = false }: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <ResponsiveImage
          src={src}
          alt={alt}
          aspectRatio={aspectRatio}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      ) : (
        <div className={cn(
          'bg-gray-800 animate-pulse rounded-lg',
          aspectRatio === '1:1' ? 'aspect-square' :
          aspectRatio === '4:3' ? 'aspect-[4/3]' :
          aspectRatio === '9:16' ? 'aspect-[9/16]' :
          aspectRatio === '3:2' ? 'aspect-[3/2]' :
          aspectRatio === '2:3' ? 'aspect-[2/3]' :
          'aspect-video'
        )}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500 text-sm">読み込み中...</div>
          </div>
        </div>
      )}
    </div>
  );
}
