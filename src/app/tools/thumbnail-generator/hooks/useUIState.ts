import { useState } from 'react';

export interface UIState {
  // タブ選択
  selectedTab: string;
  setSelectedTab: (tab: string) => void;

  // キーボード状態
  isShiftKeyDown: boolean;
  setIsShiftKeyDown: (down: boolean) => void;

  // プレビューモード
  isPreviewDedicatedMode: boolean;
  setIsPreviewDedicatedMode: (mode: boolean) => void;

  // プレビュー設定
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showAspectGuide: boolean;
  setShowAspectGuide: (show: boolean) => void;
  showSafeArea: boolean;
  setShowSafeArea: (show: boolean) => void;
  showCenterLines: boolean;
  setShowCenterLines: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  gridColor: string;
  setGridColor: (color: string) => void;
  gridOpacity: number;
  setGridOpacity: (o: number) => void;
  showMajorLines: boolean;
  setShowMajorLines: (s: boolean) => void;
  majorInterval: number;
  setMajorInterval: (n: number) => void;
  snapToGrid: boolean;
  setSnapToGrid: (s: boolean) => void;
  snapStrength: number;
  setSnapStrength: (n: number) => void;

  // シャドウエディタの状態
  shadowEnabled: boolean;
  setShadowEnabled: (enabled: boolean) => void;
}

/**
 * UI状態のみを管理する最小限のフック
 * テンプレートコンテキストやサイドバー状態は含まない
 */
export const useUIState = (): UIState => {
  // タブ選択
  const [selectedTab, setSelectedTab] = useState("tools");

  // キーボード状態
  const [isShiftKeyDown, setIsShiftKeyDown] = useState(false);

  // プレビューモード
  const [isPreviewDedicatedMode, setIsPreviewDedicatedMode] = useState(false);

  // プレビュー設定
  const [showGrid, setShowGrid] = useState(false);
  const [showAspectGuide, setShowAspectGuide] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [showCenterLines, setShowCenterLines] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [gridColor, setGridColor] = useState('rgba(136, 218, 255, 0.25)');
  const [gridOpacity, setGridOpacity] = useState(0.6);
  const [showMajorLines, setShowMajorLines] = useState(true);
  const [majorInterval, setMajorInterval] = useState(5);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [snapStrength, setSnapStrength] = useState(8);

  // シャドウエディタの状態
  const [shadowEnabled, setShadowEnabled] = useState(false);

  return {
    // タブ選択
    selectedTab,
    setSelectedTab,

    // キーボード状態
    isShiftKeyDown,
    setIsShiftKeyDown,

    // プレビューモード
    isPreviewDedicatedMode,
    setIsPreviewDedicatedMode,

    // プレビュー設定
    showGrid,
    setShowGrid,
    showAspectGuide,
    setShowAspectGuide,
    showSafeArea,
    setShowSafeArea,
    showCenterLines,
    setShowCenterLines,
    gridSize,
    setGridSize,
    gridColor,
    setGridColor,
    gridOpacity,
    setGridOpacity,
    showMajorLines,
    setShowMajorLines,
    majorInterval,
    setMajorInterval,
    snapToGrid,
    setSnapToGrid,
    snapStrength,
    setSnapStrength,

    // シャドウエディタの状態
    shadowEnabled,
    setShadowEnabled,
  };
};
