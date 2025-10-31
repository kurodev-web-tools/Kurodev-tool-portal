'use client';

import { useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import type { HistoryEntry, HistoryActionType } from '@/utils/historyUtils';
import { detectActionType, getActionIcon } from '@/utils/historyUtils';
import type { Layer } from '@/types/layers';

export const useCanvasOperations = (initialLayers: any[], initialSelectedLayerId: string | null, restoreState?: (layers: any[], selectedLayerId: string | null) => void) => {
  // ズーム機能
  const [zoom, setZoom] = useState(1);

  // 現在のレイヤー状態（履歴から復元される）
  const [currentLayers, setCurrentLayers] = useState(initialLayers);
  const [currentSelectedLayerId, setCurrentSelectedLayerId] = useState(initialSelectedLayerId);

  // アンドゥ・リドゥ機能
  // 初期状態の履歴エントリを作成
  const initialHistoryEntry: HistoryEntry = {
    id: `history-${Date.now()}`,
    timestamp: Date.now(),
    actionType: 'initial',
    description: '初期状態',
    layers: initialLayers,
    selectedLayerId: initialSelectedLayerId,
  };

  const [history, setHistory] = useState<HistoryEntry[]>([initialHistoryEntry]);
  const prevHistoryStateRef = useRef<{ layers: Layer[]; selectedLayerId: string | null }>({
    layers: initialLayers,
    selectedLayerId: initialSelectedLayerId,
  });
  const historyIndexRef = useRef(0); // 最初の履歴のインデックス
  const [historyIndex, setHistoryIndex] = useState(0); // リアクティブな履歴インデックス
  const [canUndo, setCanUndo] = useState(false); // 初期状態ではUndoできない
  const [canRedo, setCanRedo] = useState(false);
  const isUpdatingFromHistory = useRef(false);

  // 履歴に状態を追加
  const addToHistory = useCallback((layers: Layer[], selectedLayerId: string | null) => {
    if (isUpdatingFromHistory.current) return;
    
    console.log('Adding to history:', { layers: layers.length, selectedLayerId });
    
    // 前回の状態と比較して操作タイプを判定
    const prevState = prevHistoryStateRef.current;
    const { type: actionType, description } = detectActionType(
      prevState.layers,
      layers,
      prevState.selectedLayerId,
      selectedLayerId
    );
    
    const newEntry: HistoryEntry = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      actionType,
      description,
      layers: layers.map(layer => ({ ...layer })),
      selectedLayerId,
    };
    
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndexRef.current + 1);
      newHistory.push(newEntry);
      
      // 履歴の最大数を制限（50個まで）
      let newIndex: number;
      if (newHistory.length > 50) {
        newHistory.shift();
        // インデックスを調整（先頭を削除したため、1つ減らす）
        newIndex = Math.max(0, historyIndexRef.current - 1);
        historyIndexRef.current = newIndex;
      } else {
        newIndex = historyIndexRef.current + 1;
        historyIndexRef.current = newIndex;
      }
      
      // リアクティブなインデックスも更新
      setHistoryIndex(newIndex);
      
      // canUndoとcanRedoの状態を更新
      setCanUndo(newIndex > 0);
      setCanRedo(false);
      
      console.log('History updated:', {
        totalHistory: newHistory.length,
        currentIndex: historyIndexRef.current,
        canUndo: historyIndexRef.current > 0,
        canRedo: false,
        actionType,
        description,
      });
      
      return newHistory;
    });
    
    // 前回の状態を更新
    prevHistoryStateRef.current = {
      layers: layers.map(layer => ({ ...layer })),
      selectedLayerId,
    };
  }, []);

  // 指定したインデックスにジャンプ
  const jumpToHistory = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= history.length) {
      console.error('Invalid history index:', targetIndex);
      return null;
    }

    const historyEntry = history[targetIndex];
    if (!historyEntry) {
      console.error('History entry not found at index:', targetIndex);
      return null;
    }

    historyIndexRef.current = targetIndex;
    setHistoryIndex(targetIndex);
    isUpdatingFromHistory.current = true;

    // canUndoとcanRedoの状態を更新
    setCanUndo(targetIndex > 0);
    setCanRedo(targetIndex < history.length - 1);

    console.log('Jumping to history index:', targetIndex, 'description:', historyEntry.description);

    // レイヤー状態を実際に更新
    setCurrentLayers([...historyEntry.layers]);
    setCurrentSelectedLayerId(historyEntry.selectedLayerId);

    // restoreStateが提供されている場合はそれも使用
    if (restoreState) {
      restoreState(historyEntry.layers, historyEntry.selectedLayerId);
    }

    // 前回の状態を更新
    prevHistoryStateRef.current = {
      layers: historyEntry.layers.map(layer => ({ ...layer })),
      selectedLayerId: historyEntry.selectedLayerId,
    };

    setTimeout(() => {
      isUpdatingFromHistory.current = false;
    }, 100);

    return historyEntry;
  }, [history, restoreState]);

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
      return jumpToHistory(newIndex);
    }
    return null;
  }, [history, canUndo, jumpToHistory]);

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
      return jumpToHistory(newIndex);
    }
    return null;
  }, [history, canRedo, jumpToHistory]);

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
    jumpToHistory,
    
    // 履歴情報
    history,
    historyIndex: historyIndexRef.current,
    
    // 保存・ロード
    saveToLocalStorage,
    loadFromLocalStorage,
  };
};



