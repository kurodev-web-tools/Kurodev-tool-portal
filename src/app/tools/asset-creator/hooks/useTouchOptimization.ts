'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface TouchOptimizationProps {
  onPinchZoom?: (scale: number) => void;
  onDoubleTap?: () => void;
  onLongPress?: (x: number, y: number) => void;
  isEnabled?: boolean;
}

export const useTouchOptimization = ({
  onPinchZoom,
  onDoubleTap,
  onLongPress,
  isEnabled = true,
}: TouchOptimizationProps = {}) => {
  const isMobile = !useMediaQuery("(min-width: 768px)");
  const touchStateRef = useRef({
    initialDistance: 0,
    initialScale: 1,
    lastTap: 0,
    longPressTimer: null as NodeJS.Timeout | null,
    isLongPress: false,
  });

  // ピンチズーム処理
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!isEnabled || !isMobile) return;

    const touches = event.touches;
    
    if (touches.length === 2) {
      // ピンチズーム開始
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      touchStateRef.current.initialDistance = distance;
      event.preventDefault();
    } else if (touches.length === 1) {
      // 長押し検出開始
      const touch = touches[0];
      touchStateRef.current.isLongPress = false;
      touchStateRef.current.longPressTimer = setTimeout(() => {
        touchStateRef.current.isLongPress = true;
        onLongPress?.(touch.clientX, touch.clientY);
        
        // 触覚フィードバック（対応デバイスのみ）
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, 500);
    }
  }, [isEnabled, isMobile, onLongPress]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isEnabled || !isMobile) return;

    const touches = event.touches;
    
    if (touches.length === 2 && touchStateRef.current.initialDistance > 0) {
      // ピンチズーム処理
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = distance / touchStateRef.current.initialDistance;
      onPinchZoom?.(scale);
      event.preventDefault();
    } else if (touches.length === 1) {
      // 長押しタイマーをクリア（移動した場合）
      if (touchStateRef.current.longPressTimer) {
        clearTimeout(touchStateRef.current.longPressTimer);
        touchStateRef.current.longPressTimer = null;
      }
    }
  }, [isEnabled, isMobile, onPinchZoom]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!isEnabled || !isMobile) return;

    // 長押しタイマーをクリア
    if (touchStateRef.current.longPressTimer) {
      clearTimeout(touchStateRef.current.longPressTimer);
      touchStateRef.current.longPressTimer = null;
    }

    // ダブルタップ検出
    if (event.changedTouches.length === 1 && !touchStateRef.current.isLongPress) {
      const now = Date.now();
      const timeSinceLastTap = now - touchStateRef.current.lastTap;
      
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        onDoubleTap?.();
        event.preventDefault();
      }
      
      touchStateRef.current.lastTap = now;
    }

    // 状態リセット
    touchStateRef.current.initialDistance = 0;
    touchStateRef.current.isLongPress = false;
  }, [isEnabled, isMobile, onDoubleTap]);

  // パッシブリスナーでパフォーマンス向上
  useEffect(() => {
    if (!isEnabled || !isMobile) return;

    const options = { passive: false };
    
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      // クリーンアップ
      if (touchStateRef.current.longPressTimer) {
        clearTimeout(touchStateRef.current.longPressTimer);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, isEnabled, isMobile]);

  // タッチ操作のヘルプ情報
  const touchGestures = [
    { gesture: 'タップ', description: 'レイヤーを選択' },
    { gesture: 'ダブルタップ', description: 'ズームリセット' },
    { gesture: '長押し', description: 'コンテキストメニュー' },
    { gesture: 'ピンチ', description: 'ズームイン・アウト' },
    { gesture: 'ドラッグ', description: 'レイヤーを移動' },
  ];

  return {
    touchGestures,
    isMobile,
  };
};

// タッチ操作に最適化されたボタンサイズ
export const getTouchOptimizedSize = (isMobile: boolean) => ({
  buttonSize: isMobile ? 'h-11 min-w-[44px]' : 'h-8',
  iconSize: isMobile ? 'h-5 w-5' : 'h-4 w-4',
  spacing: isMobile ? 'gap-3' : 'gap-2',
  padding: isMobile ? 'p-3' : 'p-2',
});

// タッチ操作のフィードバック
export const provideTouchFeedback = (type: 'success' | 'error' | 'warning' = 'success') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'success':
        navigator.vibrate(50);
        break;
      case 'error':
        navigator.vibrate([100, 50, 100]);
        break;
      case 'warning':
        navigator.vibrate([50, 50, 50]);
        break;
    }
  }
};


