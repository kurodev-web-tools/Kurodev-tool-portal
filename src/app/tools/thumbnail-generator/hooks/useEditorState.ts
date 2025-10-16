'use client';

import { useState, useCallback, useRef } from 'react';
import { useTemplate, ShapeType } from '../contexts/TemplateContext';
import { Layer } from '@/types/layers';

interface HistoryState {
  layers: Layer[];
  selectedLayerId: string | null;
}

export interface EditorState {
  // テンプレート関連
  selectedTemplate: any;
  setSelectedTemplate: (template: any) => void;
  
  // テキスト編集
  currentText: string;
  setCurrentText: (text: string) => void;
  
  // レイヤー管理
  layers: Layer[];
  addLayer: (layer: Omit<Layer, 'id'>) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  duplicateLayer: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  
  // アスペクト比
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  customAspectRatio: { width: number; height: number };
  setCustomAspectRatio: (ratio: { width: number; height: number }) => void;
  
  // ズーム
  zoom: number;
  setZoom: (zoom: number) => void;
  
  // 履歴管理
  addToHistory: (layers: Layer[], selectedLayerId: string | null) => void;
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: () => void;
  handleRedo: () => void;
}

/**
 * エディターの状態管理フック
 * テンプレートコンテキストとキャンバス操作を統合
 */
export const useEditorState = (): EditorState => {
  // テンプレートコンテキストから状態を取得
  const templateContext = useTemplate();
  
  // ズーム機能
  const [zoom, setZoom] = useState(1);
  
  // 履歴管理
  const [history, setHistory] = useState<HistoryState[]>([{
    layers: templateContext.layers,
    selectedLayerId: templateContext.selectedLayerId
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUpdatingFromHistory = useRef(false);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 履歴に状態を追加（即座に保存）
  const addToHistory = useCallback((layers: Layer[], selectedLayerId: string | null) => {
    if (isUpdatingFromHistory.current) return;
    
    // 既存のタイムアウトをクリア
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
    
    // 即座に履歴を保存
    const newState: HistoryState = { layers: [...layers], selectedLayerId };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    // 履歴の最大数を制限（50個まで）
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  }, [history, historyIndex]);

  // アンドゥ
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const historyState = history[newIndex];
      
      setHistoryIndex(newIndex);
      isUpdatingFromHistory.current = true;
      
      // テンプレートコンテキストの状態を復元
      templateContext.restoreState(historyState.layers, historyState.selectedLayerId);
      
      setTimeout(() => {
        isUpdatingFromHistory.current = false;
      }, 100);
      
      return historyState;
    }
    return null;
  }, [history, historyIndex, templateContext]);

  // リドゥ
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const historyState = history[newIndex];
      
      setHistoryIndex(newIndex);
      isUpdatingFromHistory.current = true;
      
      // テンプレートコンテキストの状態を復元
      templateContext.restoreState(historyState.layers, historyState.selectedLayerId);
      
      setTimeout(() => {
        isUpdatingFromHistory.current = false;
      }, 100);
      
      return historyState;
    }
    return null;
  }, [history, historyIndex, templateContext]);

  return {
    // テンプレート関連
    selectedTemplate: templateContext.selectedTemplate,
    setSelectedTemplate: templateContext.setSelectedTemplate,
    
    // テキスト編集
    currentText: templateContext.currentText,
    setCurrentText: templateContext.setCurrentText,
    
    // レイヤー管理
    layers: templateContext.layers,
    addLayer: templateContext.addLayer,
    removeLayer: templateContext.removeLayer,
    updateLayer: templateContext.updateLayer,
    selectedLayerId: templateContext.selectedLayerId,
    setSelectedLayerId: templateContext.setSelectedLayerId,
    reorderLayers: templateContext.reorderLayers,
    duplicateLayer: templateContext.duplicateLayer,
    moveLayerUp: templateContext.moveLayerUp,
    moveLayerDown: templateContext.moveLayerDown,
    
    // アスペクト比
    aspectRatio: templateContext.aspectRatio,
    setAspectRatio: templateContext.setAspectRatio,
    customAspectRatio: templateContext.customAspectRatio,
    setCustomAspectRatio: templateContext.setCustomAspectRatio,
    
    // ズーム
    zoom,
    setZoom,
    
    // 履歴管理
    addToHistory,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    handleUndo,
    handleRedo,
  };
};