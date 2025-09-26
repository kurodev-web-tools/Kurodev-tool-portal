'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMediaQuery } from './use-media-query';

interface UseSidebarOptions {
  defaultOpen?: boolean;
  desktopDefaultOpen?: boolean;
}

export const useSidebar = (options: UseSidebarOptions = {}) => {
  const { defaultOpen = false, desktopDefaultOpen = true } = options;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (isDesktop && desktopDefaultOpen) {
      setIsOpen(true);
    } else if (!isDesktop) {
      setIsOpen(false);
    }
  }, [isDesktop, desktopDefaultOpen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return useMemo(() => ({
    isOpen,
    setIsOpen,
    isDesktop,
    open,
    close,
    toggle,
  }), [isOpen, isDesktop, open, close, toggle]);
};
