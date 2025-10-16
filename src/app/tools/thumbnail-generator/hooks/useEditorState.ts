'use client';

import { useState, useCallback } from 'react';
import { useTemplate, ShapeType } from '../contexts/TemplateContext';
import { Layer } from '@/types/layers';
import { useCanvasOperations } from '../../asset-creator/hooks/useCanvasOperations';

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
  
  // キャンバス操作フックから状態を取得
  const {
    zoom,
    setZoom,
    addToHistory,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useCanvasOperations(templateContext.layers, templateContext.selectedLayerId);

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
    handleUndo: undo,
    handleRedo: redo,
  };
};