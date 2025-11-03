'use client';

import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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

export const Sidebar: React.FC<SidebarProps> = memo(({
  isOpen,
  onClose,
  title,
  children,
  className,
  isDesktop = false,
  showCloseButton = true,
}) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <aside
      className={cn(
        "fixed top-0 right-0 h-[calc(100vh-2rem)] w-4/5 max-w-sm bg-[#2D2D2D]/95 backdrop-blur-sm p-4 border-l border-[#4A4A4A]/30 z-40",
        "transition-transform duration-300 ease-in-out",
        isDesktop && "md:static md:w-72 lg:w-80 xl:w-96 md:translate-x-0 md:z-auto md:h-full",
        isOpen ? 'translate-x-0' : 'translate-x-full',
        isDesktop && (isOpen ? 'md:block' : 'md:hidden'),
        className
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {showCloseButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            aria-label="サイドバーを閉じる"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="overflow-y-auto h-[calc(100%-4rem)] p-2">
        {children}
      </div>
    </aside>
  );
});

interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarToggleProps {
  onOpen: () => void;
  isDesktop?: boolean;
  className?: string;
  tabs?: TabConfig[];
  onTabClick?: (tabId: string) => void;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = memo(({
  onOpen,
  isDesktop = false,
  className,
  tabs = [],
  onTabClick,
}) => {
  const handleOpen = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const handleTabClick = useCallback((tabId: string) => {
    if (onTabClick) {
      onTabClick(tabId);
    }
    onOpen();
  }, [onTabClick, onOpen]);

  if (isDesktop) {
    // タブが指定されている場合はタブ分表示
    if (tabs.length > 0) {
      return (
        <div className={cn(
          "fixed top-1/2 right-0 -translate-y-1/2 z-30 flex flex-col bg-[#2D2D2D]/90 backdrop-blur-sm border border-[#4A4A4A]/30 rounded-l-md",
          className
        )}>
          {tabs.map((tab) => (
            <Button 
              key={tab.id}
              variant="ghost" 
              size="icon" 
              onClick={() => handleTabClick(tab.id)}
              aria-label={`${tab.label}タブを開く`}
              className="h-12 w-12 flex flex-col items-center justify-center gap-1"
            >
              {tab.icon && <span className="text-xs">{tab.icon}</span>}
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          ))}
        </div>
      );
    }
    
    // 従来の単一ボタン表示
    return (
      <div className={cn(
        "fixed top-1/2 right-0 -translate-y-1/2 z-30 flex flex-col bg-slate-800/90 backdrop-blur-sm border border-slate-600/30 rounded-l-md",
        className
      )}>
        <Button variant="ghost" size="icon" onClick={handleOpen} aria-label="サイドバーを開く">
          <PanelLeftOpen className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // モバイル用のサイドバー開くボタン（ヘッダーのプロフィールアイコンと被らないように下に配置）
  return (
    <div className={cn(
      "fixed top-20 right-4 z-20 lg:hidden",
      className
    )}>
      <Button 
        variant="default" 
        size="icon" 
        onClick={handleOpen}
        aria-label="サイドバーを開く"
        className="shadow-lg"
      >
        <PanelLeftOpen className="h-5 w-5" />
      </Button>
    </div>
  );
});
