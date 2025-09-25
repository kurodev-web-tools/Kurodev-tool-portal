'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeftClose } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  isDesktop?: boolean;
  showCloseButton?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  isDesktop = false,
  showCloseButton = true,
}) => {
  return (
    <aside
      className={cn(
        "fixed top-0 right-0 h-full w-4/5 max-w-sm bg-background p-4 border-l z-40",
        "transition-transform duration-300 ease-in-out",
        isDesktop && "lg:static lg:w-96 lg:translate-x-0 lg:z-auto",
        isOpen ? 'translate-x-0' : 'translate-x-full',
        isDesktop && (isOpen ? 'lg:block' : 'lg:hidden'),
        className
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {showCloseButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            aria-label="サイドバーを閉じる"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        )}
      </div>
      {children}
    </aside>
  );
};

interface SidebarToggleProps {
  onOpen: () => void;
  isDesktop?: boolean;
  className?: string;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({
  onOpen,
  isDesktop = false,
  className,
}) => {
  if (isDesktop) {
    return (
      <div className={cn(
        "fixed top-1/2 right-0 -translate-y-1/2 z-30 flex flex-col bg-background border rounded-l-md",
        className
      )}>
        <Button variant="ghost" size="icon" onClick={onOpen}>
          <PanelLeftClose className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return null;
};
