import { Children, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HorizontalSnapScrollProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  itemClassName?: string | ((index: number) => string);
  itemStyle?: CSSProperties | ((index: number) => CSSProperties | undefined);
}

export function HorizontalSnapScroll({
  children,
  className,
  innerClassName,
  itemClassName,
  itemStyle,
}: HorizontalSnapScrollProps) {
  return (
    <div className={cn('-mx-2 overflow-x-auto pb-4 px-2 snap-x snap-mandatory', className)}>
      <div className={cn('flex gap-4', innerClassName)}>
        {Children.map(children, (child, index) => {
          if (child === null) return null;

          const computedItemClass =
            typeof itemClassName === 'function' ? itemClassName(index) : itemClassName;
          const computedStyle =
            typeof itemStyle === 'function' ? itemStyle(index) : itemStyle;

          return (
            <div
              className={cn('snap-center shrink-0', computedItemClass)}
              style={computedStyle}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
}

