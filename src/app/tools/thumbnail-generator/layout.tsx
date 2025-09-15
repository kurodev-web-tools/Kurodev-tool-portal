'use client';

import React from 'react';
import { TemplateProvider } from './contexts/TemplateContext';

// このレイアウトはTemplateProviderを配置する役割のみを担う
export default function ThumbnailGeneratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <TemplateProvider>
      {children}
    </TemplateProvider>
  );
}
