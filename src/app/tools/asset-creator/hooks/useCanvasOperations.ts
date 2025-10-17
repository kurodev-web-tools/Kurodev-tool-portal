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
  const historyIndexRef = useRef(0); // 最初の履歴のインデックス
  const [canUndo, setCanUndo] = useState(false); // 初期状態ではUndoできない
  const [canRedo, setCanRedo] = useState(false);
  const isUpdatingFromHistory = useRef(false);

  // 履歴に状態を追加
  const addToHistory = useCallback((layers: any[], selectedLayerId: string | null) => {
    if (isUpdatingFromHistory.current) return;
    
    console.log('Adding to history:', { layers: layers.length, selectedLayerId });
    
    const newState: CanvasState = { layers: [...layers], selectedLayerId };
    
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndexRef.current + 1);
      newHistory.push(newState);
      
      // 履歴の最大数を制限（50個まで）
      if (newHistory.length > 50) {
        newHistory.shift();
        // インデックスを調整（先頭を削除したため、1つ減らす）
        historyIndexRef.current = Math.max(0, historyIndexRef.current - 1);
      } else {
        historyIndexRef.current += 1;
      }
      
      // canUndoとcanRedoの状態を更新
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(false);
      
      console.log('History updated:', {
        totalHistory: newHistory.length,
        currentIndex: historyIndexRef.current,
        canUndo: historyIndexRef.current > 0,
        canRedo: false
      });
      
      return newHistory;
    });
  }, []);

  // アンドゥ
  const undo = useCallback(() => {
    console.log('undo called:', {
      currentIndex: historyIndexRef.current,
      historyLength: history.length,
      canUndo
    });
    
    // インデックスが範囲外の場合は調整
    if (historyIndexRef.current >= history.length) {
      console.log('Index out of bounds, adjusting to:', history.length - 1);
      historyIndexRef.current = history.length - 1;
    }
    
    // インデックスが範囲内にあることを確認
    if (historyIndexRef.current > 0 && historyIndexRef.current < history.length) {
      const newIndex = historyIndexRef.current - 1;
      
      // newIndexが範囲内にあることを確認
      if (newIndex >= 0 && newIndex < history.length) {
        const historyState = history[newIndex];
        
        if (!historyState) {
          console.error('History state not found at index:', newIndex, {
            history: history,
            newIndex,
            currentIndex: historyIndexRef.current
          });
          return null;
        }
        
        historyIndexRef.current = newIndex;
        isUpdatingFromHistory.current = true;
        
        // canUndoとcanRedoの状態を更新
        setCanUndo(newIndex > 0);
        setCanRedo(newIndex < history.length - 1);
        
        console.log('Undoing to index:', newIndex, 'layers:', historyState.layers.length);
        
        // レイヤー状態を実際に更新
        setCurrentLayers([...historyState.layers]);
        setCurrentSelectedLayerId(historyState.selectedLayerId);
        
        // restoreStateが提供されている場合はそれも使用
        if (restoreState) {
          restoreState(historyState.layers, historyState.selectedLayerId);
        }
        
        setTimeout(() => {
          isUpdatingFromHistory.current = false;
        }, 100);
        
        return historyState;
      } else {
        console.error('Invalid newIndex:', newIndex, 'history length:', history.length);
        return null;
      }
    }
    return null;
  }, [history, restoreState, canUndo]);

  // リドゥ
  const redo = useCallback(() => {
    console.log('redo called:', {
      currentIndex: historyIndexRef.current,
      historyLength: history.length,
      canRedo
    });
    
    // インデックスが範囲外の場合は調整
    if (historyIndexRef.current >= history.length) {
      console.log('Index out of bounds, adjusting to:', history.length - 1);
      historyIndexRef.current = history.length - 1;
    }
    
    // インデックスが範囲内にあることを確認
    if (historyIndexRef.current >= 0 && historyIndexRef.current < history.length - 1) {
      const newIndex = historyIndexRef.current + 1;
      
      // newIndexが範囲内にあることを確認
      if (newIndex >= 0 && newIndex < history.length) {
        const historyState = history[newIndex];
        
        if (!historyState) {
          console.error('History state not found at index:', newIndex, {
            history: history,
            newIndex,
            currentIndex: historyIndexRef.current
          });
          return null;
        }
        
        historyIndexRef.current = newIndex;
        isUpdatingFromHistory.current = true;
        
        // canUndoとcanRedoの状態を更新
        setCanUndo(true);
        setCanRedo(newIndex < history.length - 1);
        
        console.log('Redoing to index:', newIndex, 'layers:', historyState.layers.length);
        
        // レイヤー状態を実際に更新
        setCurrentLayers([...historyState.layers]);
        setCurrentSelectedLayerId(historyState.selectedLayerId);
        
        // restoreStateが提供されている場合はそれも使用
        if (restoreState) {
          restoreState(historyState.layers, historyState.selectedLayerId);
        }
        
        setTimeout(() => {
          isUpdatingFromHistory.current = false;
        }, 100);
        
        return historyState;
      } else {
        console.error('Invalid newIndex:', newIndex, 'history length:', history.length);
        return null;
      }
    }
    return null;
  }, [history, restoreState, canRedo]);

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
    canUndo,
    canRedo,
    addToHistory,
    resetHistoryFlag,
    
    // 保存・ロード
    saveToLocalStorage,
    loadFromLocalStorage,
  };
};



