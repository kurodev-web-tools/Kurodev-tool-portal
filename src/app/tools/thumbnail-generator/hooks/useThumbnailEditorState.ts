/**
 * サムネイルエディターのState管理カスタムフック
 * UI状態、プレビュー設定、エクスポート状態などを一元管理
 */

import React from 'react';

export interface ThumbnailEditorState {
  // UI状態
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  isShiftKeyDown: boolean;
  setIsShiftKeyDown: (value: boolean) => void;
  isPreviewDedicatedMode: boolean;
  setIsPreviewDedicatedMode: (value: boolean) => void;
  
  // プレビュー設定
  showGrid: boolean;
  setShowGrid: (value: boolean) => void;
  showAspectGuide: boolean;
  setShowAspectGuide: (value: boolean) => void;
  showSafeArea: boolean;
  setShowSafeArea: (value: boolean) => void;
  gridSize: number;
  setGridSize: (value: number) => void;
  
  // シャドウエディタ
  shadowEnabled: boolean;
  setShadowEnabled: (value: boolean) => void;
}

/**
 * サムネイルエディターのState管理フック
 * @returns State と State更新関数のオブジェクト
 */
export const useThumbnailEditorState = (): ThumbnailEditorState => {
  // UI状態管理
  const [selectedTab, setSelectedTab] = React.useState("settings");
  const [isShiftKeyDown, setIsShiftKeyDown] = React.useState(false);
  const [isPreviewDedicatedMode, setIsPreviewDedicatedMode] = React.useState(false);
  
  // プレビュー設定の状態
  const [showGrid, setShowGrid] = React.useState(false);
  const [showAspectGuide, setShowAspectGuide] = React.useState(true);
  const [showSafeArea, setShowSafeArea] = React.useState(false);
  const [gridSize, setGridSize] = React.useState(20);
  
  // シャドウエディタの状態
  const [shadowEnabled, setShadowEnabled] = React.useState(false);

  return {
    // UI状態
    selectedTab,
    setSelectedTab,
    isShiftKeyDown,
    setIsShiftKeyDown,
    isPreviewDedicatedMode,
    setIsPreviewDedicatedMode,
    
    // プレビュー設定
    showGrid,
    setShowGrid,
    showAspectGuide,
    setShowAspectGuide,
    showSafeArea,
    setShowSafeArea,
    gridSize,
    setGridSize,
    
    // シャドウエディタ
    shadowEnabled,
    setShadowEnabled,
  };
};

