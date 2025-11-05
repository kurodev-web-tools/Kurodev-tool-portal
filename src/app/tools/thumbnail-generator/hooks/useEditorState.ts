'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTemplate, ShapeType } from '../contexts/TemplateContext';
import { Layer } from '@/types/layers';
import { useMediaQuery } from '@/hooks/use-media-query';
import { HistoryEntry, detectActionType } from '@/utils/historyUtils';

export interface EditorState {
  // テンプレート関連
  selectedTemplate: any;
  setSelectedTemplate: (template: any) => void;
  
  // テキスト編集
  currentText: string;
  setCurrentText: (text: string) => void;
  
  // レイヤー管理
  layers: Layer[];
  addLayer: (layer: Omit<Layer, 'id' | 'rotation' | 'zIndex'>) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  duplicateLayer: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  handleAddShape: (shapeType: ShapeType) => void;
  
  // アスペクト比
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  customAspectRatio: { width: number; height: number };
  setCustomAspectRatio: (ratio: { width: number; height: number }) => void;
  
  // ズーム
  zoom: number;
  setZoom: (zoom: number | ((prevZoom: number) => number)) => void;
  
  // 履歴管理
  addToHistory: (layers: Layer[], selectedLayerId: string | null) => void;
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: () => HistoryEntry | null;
  handleRedo: () => HistoryEntry | null;
  history: HistoryEntry[];
  historyIndex: number;
  jumpToHistory: (index: number) => void;
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
  
  // レスポンシブ対応
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  // 履歴管理
  const prevHistoryRef = useRef<{ layers: Layer[]; selectedLayerId: string | null }>({
    layers: templateContext.layers,
    selectedLayerId: templateContext.selectedLayerId
  });

  const [history, setHistory] = useState<HistoryEntry[]>([{
    id: `initial-${Date.now()}`,
    timestamp: Date.now(),
    actionType: 'initial',
    description: '初期状態',
    layers: templateContext.layers,
    selectedLayerId: templateContext.selectedLayerId
  }]);
  const historyIndexRef = useRef(0); // 最初の履歴のインデックス
  const [historyIndex, setHistoryIndex] = useState(0);
  const [canUndo, setCanUndo] = useState(false); // 初期状態ではUndoできない
  const [canRedo, setCanRedo] = useState(false);
  const isUpdatingFromHistory = useRef(false);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 履歴の初期化をログ出力
  console.log('useEditorState initialized:', {
    historyLength: history.length,
    historyIndex: historyIndexRef.current,
    canUndo,
    canRedo,
    layers: templateContext.layers.length
  });

  // 履歴に状態を追加（即座に保存）
  const addToHistory = useCallback((layers: Layer[], selectedLayerId: string | null) => {
    if (isUpdatingFromHistory.current) return;
    
    console.log('Adding to history:', { layers: layers.length, selectedLayerId });
    
    // 既存のタイムアウトをクリア
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
    
    // 操作タイプを自動判定
    const prevLayers = prevHistoryRef.current.layers;
    const prevSelectedId = prevHistoryRef.current.selectedLayerId;
    const { type, description } = detectActionType(prevLayers, layers, prevSelectedId, selectedLayerId);
    
    // HistoryEntryを作成
    const newEntry: HistoryEntry = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      actionType: type,
      description,
      layers: [...layers],
      selectedLayerId
    };
    
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndexRef.current + 1);
      newHistory.push(newEntry);
      
      // 履歴の最大数を制限（50個まで）
      if (newHistory.length > 50) {
        newHistory.shift();
        // インデックスを調整（先頭を削除したため、1つ減らす）
        historyIndexRef.current = Math.max(0, historyIndexRef.current - 1);
      } else {
        historyIndexRef.current += 1;
      }
      
      setHistoryIndex(historyIndexRef.current);
      
      // canUndoとcanRedoの状態を更新
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(false); // 新しい履歴を追加した後はredoできない
      
      console.log('History updated:', { 
        totalHistory: newHistory.length, 
        currentIndex: historyIndexRef.current,
        canUndo: historyIndexRef.current > 0,
        canRedo: false,
        description
      });
      
      // 前の状態を更新
      prevHistoryRef.current = { layers, selectedLayerId };
      
      return newHistory;
    });
  }, []);

  // 履歴ジャンプ機能
  const jumpToHistory = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= history.length) {
      console.error('Invalid history index:', targetIndex, 'history length:', history.length);
      return;
    }

    const historyEntry = history[targetIndex];
    if (!historyEntry) {
      console.error('History entry not found at index:', targetIndex);
      return;
    }

    historyIndexRef.current = targetIndex;
    setHistoryIndex(targetIndex);
    isUpdatingFromHistory.current = true;
    
    // canUndoとcanRedoの状態を更新
    setCanUndo(targetIndex > 0);
    setCanRedo(targetIndex < history.length - 1);

    console.log('Jumping to history index:', targetIndex, 'layers:', historyEntry.layers.length);

    // テンプレートコンテキストの状態を復元
    templateContext.restoreState(historyEntry.layers, historyEntry.selectedLayerId);

    // 前の状態を更新
    prevHistoryRef.current = { layers: historyEntry.layers, selectedLayerId: historyEntry.selectedLayerId };

    setTimeout(() => {
      isUpdatingFromHistory.current = false;
    }, 100);
  }, [history, templateContext]);

  // アンドゥ
  const handleUndo = useCallback(() => {
    console.log('handleUndo called:', {
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
        setHistoryIndex(newIndex);
        isUpdatingFromHistory.current = true;
        
        // canUndoとcanRedoの状態を更新
        setCanUndo(newIndex > 0);
        setCanRedo(true);
        
        console.log('Undoing to index:', newIndex, 'layers:', historyState.layers.length);
        
        // テンプレートコンテキストの状態を復元
        templateContext.restoreState(historyState.layers, historyState.selectedLayerId);
        
        // 前の状態を更新
        prevHistoryRef.current = { layers: historyState.layers, selectedLayerId: historyState.selectedLayerId };
        
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
  }, [history, templateContext, canUndo]);

  // リドゥ
  const handleRedo = useCallback(() => {
    console.log('handleRedo called:', {
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
        setHistoryIndex(newIndex);
        isUpdatingFromHistory.current = true;
        
        // canUndoとcanRedoの状態を更新
        setCanUndo(true);
        setCanRedo(newIndex < history.length - 1);
        
        console.log('Redoing to index:', newIndex, 'layers:', historyState.layers.length);
        
        // テンプレートコンテキストの状態を復元
        templateContext.restoreState(historyState.layers, historyState.selectedLayerId);
        
        // 前の状態を更新
        prevHistoryRef.current = { layers: historyState.layers, selectedLayerId: historyState.selectedLayerId };
        
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
  }, [history, templateContext]);

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
    handleAddShape: useCallback((shapeType: ShapeType) => {
      const offset = templateContext.layers.filter(l => l.type === 'shape').length * (isDesktop ? 20 : 5);
      const shapeCount = templateContext.layers.filter(l => l.type === 'shape' && 'shapeType' in l && l.shapeType === shapeType).length + 1;
      let name = '';
      const initialX = isDesktop ? 550 : 10;
      const initialY = isDesktop ? 250 : 10;
      const initialWidth = isDesktop ? 300 : 50;
      const initialHeight = isDesktop ? 300 : 50;
      const initialBorderWidth = isDesktop ? 2 : 1;
      const lineArrowWidth = isDesktop ? 300 : 100;
      const lineArrowHeight = isDesktop ? 5 : 3;

      switch (shapeType) {
        case 'rectangle': name = `四角 ${shapeCount}`; break;
        case 'circle': name = `円 ${shapeCount}`; break;
        case 'line': name = `線 ${shapeCount}`; break;
        case 'arrow': name = `矢印 ${shapeCount}`; break;
      }

      templateContext.addLayer({
        type: 'shape',
        shapeType,
        name,
        visible: true,
        locked: false,
        x: initialX + offset,
        y: initialY + offset,
        width: (shapeType === 'line' || shapeType === 'arrow') ? lineArrowWidth : initialWidth,
        height: (shapeType === 'line' || shapeType === 'arrow') ? lineArrowHeight : initialHeight,
        backgroundColor: '#cccccc',
        borderColor: '#000000',
        borderWidth: initialBorderWidth,
      } as any);
    }, [templateContext.addLayer, templateContext.layers, isDesktop]),
    
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
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    history,
    historyIndex,
    jumpToHistory,
  };
};