'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
  handleUndo: () => HistoryState | null;
  handleRedo: () => HistoryState | null;
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
  const historyIndexRef = useRef(0); // 最初の履歴のインデックス
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
    
    // 即座に履歴を保存
    const newState: HistoryState = { layers: [...layers], selectedLayerId };
    
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
      setCanRedo(false); // 新しい履歴を追加した後はredoできない
      
      console.log('History updated:', { 
        totalHistory: newHistory.length, 
        currentIndex: historyIndexRef.current,
        canUndo: historyIndexRef.current > 0,
        canRedo: false
      });
      
      return newHistory;
    });
  }, []);

  // レイヤーの変更を監視して履歴を保存（フック内で直接監視）
  useEffect(() => {
    console.log('useEditorState layers effect triggered:', {
      layers: templateContext.layers.length,
      selectedLayerId: templateContext.selectedLayerId
    });
    
    // レイヤーが存在する場合は履歴を保存
    if (templateContext.layers.length > 0) {
      console.log('Saving initial layers to history from useEditorState');
      addToHistory(templateContext.layers, templateContext.selectedLayerId);
    }
  }, [templateContext.layers.length, templateContext.selectedLayerId, addToHistory]);

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
        isUpdatingFromHistory.current = true;
        
        // canUndoとcanRedoの状態を更新
        setCanUndo(newIndex > 0);
        setCanRedo(true);
        
        console.log('Undoing to index:', newIndex, 'layers:', historyState.layers.length);
        
        // テンプレートコンテキストの状態を復元
        templateContext.restoreState(historyState.layers, historyState.selectedLayerId);
        
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
        isUpdatingFromHistory.current = true;
        
        // canUndoとcanRedoの状態を更新
        setCanUndo(true);
        setCanRedo(newIndex < history.length - 1);
        
        console.log('Redoing to index:', newIndex, 'layers:', historyState.layers.length);
        
        // テンプレートコンテキストの状態を復元
        templateContext.restoreState(historyState.layers, historyState.selectedLayerId);
        
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
  };
};