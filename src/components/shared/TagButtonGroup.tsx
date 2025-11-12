import { memo } from 'react';
import type { ComponentType, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TagButtonGroupProps {
  label: ReactNode;
  items: string[];
  onItemClick: (value: string) => void;
  icon?: ComponentType<{ className?: string }>;
  maxVisible?: number;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  buttonClassName?: string;
  itemClassName?: string;
  hiddenWhenEmpty?: boolean;
}

export const TagButtonGroup = memo(function TagButtonGroup({
  label,
  items,
  onItemClick,
  icon: Icon,
  maxVisible = 5,
  buttonVariant = 'outline',
  buttonSize = 'sm',
  buttonClassName,
  itemClassName,
  hiddenWhenEmpty = true,
}: TagButtonGroupProps) {
  if (hiddenWhenEmpty && items.length === 0) {
    return null;
  }

  const visibleItems = items.slice(0, maxVisible);

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', itemClassName)}>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      {visibleItems.map((value) => (
        <Button
          key={value}
          variant={buttonVariant}
          size={buttonSize}
          className={cn('text-xs h-9 md:h-7', buttonClassName)}
          onClick={() => onItemClick(value)}
        >
          {Icon ? <Icon className="h-3 w-3 md:h-3 mr-1" /> : null}
          {value}
        </Button>
      ))}
    </div>
  );
});

