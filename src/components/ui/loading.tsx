'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createAccessibilityAttributes } from '@/lib/accessibility';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  ariaLabel?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className,
  fullScreen = false,
  overlay = false,
  ariaLabel = '読み込み中',
}) => {
  const accessibilityAttrs = createAccessibilityAttributes(
    'status',
    {
      'aria-label': ariaLabel,
      'aria-live': 'polite',
      'aria-atomic': true,
    }
  );

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        fullScreen && 'min-h-screen',
        overlay && 'absolute inset-0 bg-background/80 backdrop-blur-sm',
        className
      )}
      {...accessibilityAttrs}
    >
      <Loader2 className={cn('animate-spin', sizeClasses[size])} aria-hidden="true" />
      {text && (
        <p className="text-sm text-muted-foreground" aria-hidden="true">
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="relative">
        {content}
      </div>
    );
  }

  return content;
};

interface SkeletonLoadingProps {
  count?: number;
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  count = 1,
  className,
  height = 'h-4',
  width = 'w-full',
  rounded = true,
}) => {
  return (
    <div className="space-y-2" role="status" aria-label="読み込み中">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse bg-muted',
            height,
            width,
            rounded && 'rounded',
            className
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

interface ProgressLoadingProps {
  progress: number;
  text?: string;
  className?: string;
  showPercentage?: boolean;
  ariaLabel?: string;
}

export const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  progress,
  text,
  className,
  showPercentage = true,
  ariaLabel = '進行状況',
}) => {
  const accessibilityAttrs = createAccessibilityAttributes(
    'progressbar',
    {
      'aria-label': ariaLabel,
      'aria-valuenow': progress,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuetext': `${progress}%完了`,
    }
  );

  return (
    <div className={cn('w-full space-y-2', className)}>
      {text && (
        <p className="text-sm text-muted-foreground" aria-hidden="true">
          {text}
        </p>
      )}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          {...accessibilityAttrs}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-muted-foreground text-right" aria-hidden="true">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'muted';
  ariaLabel?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary',
  ariaLabel = '読み込み中',
}) => {
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted-foreground',
  };

  const accessibilityAttrs = createAccessibilityAttributes(
    'status',
    {
      'aria-label': ariaLabel,
      'aria-live': 'polite',
    }
  );

  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...accessibilityAttrs}
    />
  );
};
