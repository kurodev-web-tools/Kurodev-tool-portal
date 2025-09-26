/**
 * パフォーマンス最適化用のユーティリティ関数
 */

/**
 * デバウンス関数
 * 連続して呼び出される関数の実行を遅延させる
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * スロットル関数
 * 関数の実行頻度を制限する
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 遅延読み込み用のIntersection Observer
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

/**
 * 画像の遅延読み込み
 */
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  const observer = createIntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  });
  
  observer.observe(img);
}

/**
 * メモリ使用量の監視
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
  
  return { used: 0, total: 0, percentage: 0 };
}

/**
 * パフォーマンス測定用のマーカー
 */
export function markPerformance(name: string): void {
  if ('mark' in performance) {
    performance.mark(name);
  }
}

/**
 * パフォーマンス測定の開始
 */
export function startPerformanceMeasure(name: string): void {
  markPerformance(`${name}-start`);
}

/**
 * パフォーマンス測定の終了
 */
export function endPerformanceMeasure(name: string): number | null {
  markPerformance(`${name}-end`);
  
  if ('measure' in performance) {
    try {
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = performance.getEntriesByName(name)[0];
      return measure.duration;
    } catch (error) {
      console.warn(`Performance measure failed for ${name}:`, error);
      return null;
    }
  }
  
  return null;
}

/**
 * バンドルサイズの最適化用：動的インポート
 */
export async function dynamicImport<T>(importFn: () => Promise<T>): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    console.error('Dynamic import failed:', error);
    throw error;
  }
}

/**
 * キャッシュ戦略：LRU Cache
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // アクセスされた要素を最後に移動
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 最初の要素（最も古い）を削除
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
