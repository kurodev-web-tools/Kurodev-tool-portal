'use client';

import { useState, useCallback, useRef } from 'react';

interface CanvasState {
  layers: any[];
  selectedLayerId: string | null;
}

export const useCanvasOperations = (initialLayers: any[], initialSelectedLayerId: string | null) => {
  // ズーム機能
  const [zoom, setZoom] = useState(1);

  // アンドゥ・リドゥ機能
  const [history, setHistory] = useState<CanvasState[]>([{
    layers: initialLayers,
    selectedLayerId: initialSelectedLayerId
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUpdatingFromHistory = useRef(false);

  // 履歴に状態を追加
  const addToHistory = useCallback((layers: any[], selectedLayerId: string | null) => {
    if (isUpdatingFromHistory.current) return;
    
    const newState: CanvasState = { layers: [...layers], selectedLayerId };
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
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      isUpdatingFromHistory.current = true;
      return history[newIndex];
    }
    return null;
  }, [history, historyIndex]);

  // リドゥ
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      isUpdatingFromHistory.current = true;
      return history[newIndex];
    }
    return null;
  }, [history, historyIndex]);

  // 履歴更新フラグをリセット
  const resetHistoryFlag = useCallback(() => {
    isUpdatingFromHistory.current = false;
  }, []);

  // 保存機能（ローカルストレージ）
  const saveToLocalStorage = useCallback((layers: any[], selectedLayerId: string | null) => {
    try {
      const saveData = {
        layers,
        selectedLayerId,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('asset-creator-save', JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('保存に失敗しました:', error);
      return false;
    }
  }, []);

  // ロード機能（ローカルストレージ）
  const loadFromLocalStorage = useCallback(() => {
    try {
      const saveData = localStorage.getItem('asset-creator-save');
      if (saveData) {
        return JSON.parse(saveData);
      }
    } catch (error) {
      console.error('ロードに失敗しました:', error);
    }
    return null;
  }, []);

  return {
    // ズーム
    zoom,
    setZoom,
    
    // アンドゥ・リドゥ
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    addToHistory,
    resetHistoryFlag,
    
    // 保存・ロード
    saveToLocalStorage,
    loadFromLocalStorage,
  };
};



