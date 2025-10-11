/**
 * アセットエディターのState管理カスタムフック
 * UI状態、プレビュー設定、エクスポート状態などを一元管理
 */

import React from 'react';

export interface AssetEditorState {
  // UI状態
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  isShiftKeyDown: boolean;
  setIsShiftKeyDown: (value: boolean) => void;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
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
 * アセットエディターのState管理フック
 * @returns State と State更新関数のオブジェクト
 */
export const useAssetEditorState = (): AssetEditorState => {
  // UI状態管理
  const [selectedTab, setSelectedTab] = React.useState("settings");
  const [isShiftKeyDown, setIsShiftKeyDown] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
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
    isExporting,
    setIsExporting,
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

