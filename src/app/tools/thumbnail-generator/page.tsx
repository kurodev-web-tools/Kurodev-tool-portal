'use client';

import React from 'react';
import { TemplateProvider } from './contexts/TemplateContext';
import { EditorProvider } from '@/contexts/EditorContext';
import { EditorUI } from './components/EditorUI';

export default function ThumbnailGeneratorPage() {
  return (
    <EditorProvider>
      <TemplateProvider>
        <EditorUI />
      </TemplateProvider>
    </EditorProvider>
  );
}
