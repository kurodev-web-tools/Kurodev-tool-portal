'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  fallbackHref?: string;
  fallbackLabel?: string;
  showHomeButton?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function BackButton({
  fallbackHref = '/',
  fallbackLabel = 'ホーム',
  showHomeButton = true,
  className,
  variant = 'outline',
  size = 'default'
}: BackButtonProps) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // ブラウザ履歴の長さをチェック
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant={variant}
        size={size}
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 hover:bg-blue-500/10"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{canGoBack ? '戻る' : fallbackLabel}</span>
      </Button>

      {showHomeButton && (
        <Button
          variant="ghost"
          size={size}
          onClick={handleHome}
          className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
        >
          <Home className="h-4 w-4" />
          <span>ホーム</span>
        </Button>
      )}
    </div>
  );
}

// シンプルな戻るボタン（アイコンのみ）
export function SimpleBackButton({
  fallbackHref = '/',
  className,
  size = 'sm'
}: Omit<BackButtonProps, 'showHomeButton' | 'variant'>) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleBack}
      className={cn(
        "p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10",
        className
      )}
      title={canGoBack ? '戻る' : 'ホームに戻る'}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}
