'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DebugPanel } from './debug-panel';

interface DebugContextType {
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  isPanelOpen: boolean;
  togglePanel: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugPanelProvider');
  }
  return context;
}

interface DebugPanelProviderProps {
  children: React.ReactNode;
}

export function DebugPanelProvider({ children }: DebugPanelProviderProps) {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    // 開発環境でのみデバッグモードを有効化
    const isDevelopment = process.env.NODE_ENV === 'development';
    setIsDebugMode(isDevelopment);
  }, []);

  useEffect(() => {
    // キーボードショートカット（Ctrl+Shift+D）でデバッグパネルを切り替え
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        togglePanel();
      }
    };

    if (isDebugMode) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isDebugMode]);

  const toggleDebugMode = () => {
    setIsDebugMode(prev => !prev);
    if (isPanelOpen) {
      setIsPanelOpen(false);
    }
  };

  const togglePanel = () => {
    setIsPanelOpen(prev => !prev);
  };

  const contextValue: DebugContextType = {
    isDebugMode,
    toggleDebugMode,
    isPanelOpen,
    togglePanel,
  };

  return (
    <DebugContext.Provider value={contextValue}>
      {children}
      {isDebugMode && (
        <DebugPanel
          isOpen={isPanelOpen}
          onToggle={togglePanel}
        />
      )}
    </DebugContext.Provider>
  );
}
