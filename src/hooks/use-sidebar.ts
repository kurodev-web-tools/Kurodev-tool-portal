'use client';

import { useState, useEffect } from 'react';
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

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    setIsOpen,
    isDesktop,
    open,
    close,
    toggle,
  };
};
