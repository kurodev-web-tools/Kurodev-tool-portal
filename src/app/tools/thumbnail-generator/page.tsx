'use client';

import React from 'react';
import { TemplateProvider } from './contexts/TemplateContext';
import { EditorUI } from './components/EditorUI';

export default function ThumbnailGeneratorPage() {
  return (
    <TemplateProvider>
      <EditorUI />
    </TemplateProvider>
  );
}
