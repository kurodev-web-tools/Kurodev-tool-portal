'use client';

import { useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

interface CanvasState {
  layers: any[];
  selectedLayerId: string | null;
}

export const useCanvasOperations = (initialLayers: any[], initialSelectedLayerId: string | null, restoreState?: (layers: any[], selectedLayerId: string | null) => void) => {
  // ズーム機能
  const [zoom, setZoom] = useState(1);

  // 現在のレイヤー状態（履歴から復元される）
  const [currentLayers, setCurrentLayers] = useState(initialLayers);
  const [currentSelectedLayerId, setCurrentSelectedLayerId] = useState(initialSelectedLayerId);

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
      const historyState = history[newIndex];
      
      setHistoryIndex(newIndex);
      isUpdatingFromHistory.current = true;
      
      // レイヤー状態を実際に更新
      setCurrentLayers([...historyState.layers]);
      setCurrentSelectedLayerId(historyState.selectedLayerId);
      
      // restoreStateが提供されている場合はそれも使用
      if (restoreState) {
        restoreState(historyState.layers, historyState.selectedLayerId);
      }
      
      return historyState;
    }
    return null;
  }, [history, historyIndex, restoreState]);

  // リドゥ
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const historyState = history[newIndex];
      
      setHistoryIndex(newIndex);
      isUpdatingFromHistory.current = true;
      
      // レイヤー状態を実際に更新
      setCurrentLayers([...historyState.layers]);
      setCurrentSelectedLayerId(historyState.selectedLayerId);
      
      // restoreStateが提供されている場合はそれも使用
      if (restoreState) {
        restoreState(historyState.layers, historyState.selectedLayerId);
      }
      
      return historyState;
    }
    return null;
  }, [history, historyIndex, restoreState]);

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
      logger.error('保存失敗', error, 'useCanvasOperations');
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
      logger.error('ロード失敗', error, 'useCanvasOperations');
    }
    return null;
  }, []);

  return {
    // ズーム
    zoom,
    setZoom,
    
    // 現在のレイヤー状態
    currentLayers,
    currentSelectedLayerId,
    
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



