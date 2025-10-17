'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Layer, LayerType, ShapeType } from '@/types/layers';
import { v4 as uuidv4 } from 'uuid';

// 共通型を再エクスポート
export type { Layer, LayerType, ShapeType };

/**
 * 共通EditorContext - 両ツールで共通使用する基盤機能
 * 
 * 共通機能:
 * - レイヤー管理（addLayer, removeLayer, updateLayer等）
 * - アスペクト比管理（aspectRatio, customAspectRatio）
 * - プレビュー設定（showGrid, showAspectGuide等）
 * - 履歴管理（undo, redo, canUndo, canRedo）
 * - テキスト編集（currentText）
 * 
 * ツール固有機能は除外:
 * - thumbnail-generatorのテンプレート機能
 * - カラーパレット、フォント設定
 */
interface EditorContextType {
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
  
  // アスペクト比管理
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  customAspectRatio: { width: number; height: number };
  setCustomAspectRatio: (aspect: { width: number; height: number }) => void;
  
  // プレビュー設定
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showAspectGuide: boolean;
  setShowAspectGuide: (show: boolean) => void;
  showSafeArea: boolean;
  setShowSafeArea: (show: boolean) => void;
  
  // 履歴管理
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  
  // テキスト編集
  currentText: string;
  setCurrentText: (text: string) => void;
  
  // 状態復元
  restoreState: (layers: Layer[], selectedLayerId: string | null) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

// デフォルトアスペクト比
const DEFAULT_ASPECT_RATIO = '16:9';
const DEFAULT_CUSTOM_ASPECT_RATIO = { width: 16, height: 9 };

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  // レイヤー管理
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  // アスペクト比管理
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);
  const [customAspectRatio, setCustomAspectRatio] = useState(DEFAULT_CUSTOM_ASPECT_RATIO);
  
  // プレビュー設定
  const [showGrid, setShowGrid] = useState(false);
  const [showAspectGuide, setShowAspectGuide] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);
  
  // テキスト編集
  const [currentText, setCurrentText] = useState('テキスト');
  
  // 履歴管理
  const [history, setHistory] = useState<Layer[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // 履歴の計算
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  // レイヤー追加
  const addLayer = useCallback((layer: Omit<Layer, 'id' | 'rotation' | 'zIndex'>) => {
    const newLayer: Layer = {
      ...layer,
      id: uuidv4(),
      rotation: 0,
      zIndex: layers.length,
    } as Layer;
    
    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    
    // 履歴に追加
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // 新しく追加したレイヤーを選択
    setSelectedLayerId(newLayer.id);
  }, [layers, history, historyIndex]);
  
  // レイヤー削除
  const removeLayer = useCallback((id: string) => {
    const newLayers = layers.filter(layer => layer.id !== id);
    setLayers(newLayers);
    
    // 履歴に追加
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // 削除されたレイヤーが選択されていた場合は選択を解除
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  }, [layers, history, historyIndex, selectedLayerId]);
  
  // レイヤー更新
  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    const newLayers = layers.map(layer => 
      layer.id === id ? { ...layer, ...updates } as Layer : layer
    );
    setLayers(newLayers);
    
    // 履歴に追加
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [layers, history, historyIndex]);
  
  // レイヤー順序変更
  const reorderLayers = useCallback((startIndex: number, endIndex: number) => {
    const newLayers = [...layers];
    const [removed] = newLayers.splice(startIndex, 1);
    newLayers.splice(endIndex, 0, removed);
    
    // zIndexを更新
    const updatedLayers = newLayers.map((layer, index) => ({
      ...layer,
      zIndex: index,
    }));
    
    setLayers(updatedLayers);
    
    // 履歴に追加
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedLayers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [layers, history, historyIndex]);
  
  // レイヤー複製
  const duplicateLayer = useCallback((id: string) => {
    const layerToDuplicate = layers.find(layer => layer.id === id);
    if (!layerToDuplicate) return;
    
    const duplicatedLayer: Layer = {
      ...layerToDuplicate,
      id: uuidv4(),
      name: `${layerToDuplicate.name} コピー`,
      x: layerToDuplicate.x + 20,
      y: layerToDuplicate.y + 20,
      zIndex: layers.length,
    };
    
    const newLayers = [...layers, duplicatedLayer];
    setLayers(newLayers);
    
    // 履歴に追加
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // 複製されたレイヤーを選択
    setSelectedLayerId(duplicatedLayer.id);
  }, [layers, history, historyIndex]);
  
  // レイヤー上移動
  const moveLayerUp = useCallback((id: string) => {
    const layerIndex = layers.findIndex(layer => layer.id === id);
    if (layerIndex === -1 || layerIndex === layers.length - 1) return;
    
    reorderLayers(layerIndex, layerIndex + 1);
  }, [layers, reorderLayers]);
  
  // レイヤー下移動
  const moveLayerDown = useCallback((id: string) => {
    const layerIndex = layers.findIndex(layer => layer.id === id);
    if (layerIndex === -1 || layerIndex === 0) return;
    
    reorderLayers(layerIndex, layerIndex - 1);
  }, [layers, reorderLayers]);
  
  // Undo
  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLayers(history[newIndex]);
    }
  }, [canUndo, historyIndex, history]);
  
  // Redo
  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLayers(history[newIndex]);
    }
  }, [canRedo, historyIndex, history]);
  
  // 状態復元
  const restoreState = useCallback((newLayers: Layer[], newSelectedLayerId: string | null) => {
    setLayers(newLayers);
    setSelectedLayerId(newSelectedLayerId);
    
    // 履歴に追加
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  const value: EditorContextType = {
    // レイヤー管理
    layers,
    addLayer,
    removeLayer,
    updateLayer,
    selectedLayerId,
    setSelectedLayerId,
    reorderLayers,
    duplicateLayer,
    moveLayerUp,
    moveLayerDown,
    
    // アスペクト比管理
    aspectRatio,
    setAspectRatio,
    customAspectRatio,
    setCustomAspectRatio,
    
    // プレビュー設定
    showGrid,
    setShowGrid,
    showAspectGuide,
    setShowAspectGuide,
    showSafeArea,
    setShowSafeArea,
    
    // 履歴管理
    canUndo,
    canRedo,
    undo,
    redo,
    
    // テキスト編集
    currentText,
    setCurrentText,
    
    // 状態復元
    restoreState,
  };
  
  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

// カスタムフック
export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
