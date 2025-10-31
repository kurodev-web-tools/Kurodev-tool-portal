'use client';

import React from 'react';
import { toPng } from 'html-to-image';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { ResizableDelta, Position } from 'react-rnd';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useTemplate, ShapeType, TemplateProvider } from './contexts/TemplateContext';
import { EditorProvider } from '@/contexts/EditorContext';
import { ToolbarSection } from './components/ToolbarSection';
import { LeftSidebar } from './components/LeftSidebar';
import { RightToolbar } from './components/RightToolbar';
import { PreviewSection } from './components/PreviewSection';
import { UnifiedLayerPanel } from '@/components/shared/UnifiedLayerPanel';
import { useCanvasOperations } from './hooks/useCanvasOperations';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { AssetExportSettingsPanel, AssetExportSettings } from './components/AssetExportSettingsPanel';
import { logger } from '@/lib/logger';
import { isTextLayer, isImageLayer, isShapeLayer } from '@/types/layers';
import { FontSelector } from '@/components/shared/FontSelector';
import { ShapeTypeSelector } from '@/components/shared/ShapeTypeSelector';
import { parseTextShadow, buildTextShadow } from '@/utils/textShadowUtils';
import { FILTER_PRESETS, applyPreset, type ImageFilters } from '@/utils/imageFilters';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function AssetCreatorPage() {
  // UI状態管理  
  const { isOpen: isLeftSidebarOpen, setIsOpen: setIsLeftSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });
  const { isOpen: isRightSidebarOpen, setIsOpen: setIsRightSidebarOpen } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });
  const [selectedTab, setSelectedTab] = React.useState("settings");
  const [isExporting, setIsExporting] = React.useState(false);
  const [isPreviewDedicatedMode, setIsPreviewDedicatedMode] = React.useState(false);
  
  // プレビュー設定の状態
  const [showGrid, setShowGrid] = React.useState(false);
  const [showAspectGuide, setShowAspectGuide] = React.useState(true);
  const [showSafeArea, setShowSafeArea] = React.useState(false);
  const [showCenterLines, setShowCenterLines] = React.useState(false);
  const [gridSize, setGridSize] = React.useState(20);
  const [gridColor, setGridColor] = React.useState('rgba(136, 218, 255, 0.25)');
  const [gridOpacity, setGridOpacity] = React.useState(0.6);
  const [showMajorLines, setShowMajorLines] = React.useState(true);
  const [majorInterval, setMajorInterval] = React.useState(5);
  const [snapToGrid, setSnapToGrid] = React.useState(false);
  const [snapStrength, setSnapStrength] = React.useState(8);
  
  // シャドウエディタの状態
  const [shadowEnabled, setShadowEnabled] = React.useState(false);
  const [outlineEnabled, setOutlineEnabled] = React.useState(false);
  const [gradientEnabled, setGradientEnabled] = React.useState(false);
  
  // カスタムグラデーション用の状態
  const [customColor1, setCustomColor1] = React.useState('#ff0000');
  const [customColor2, setCustomColor2] = React.useState('#0000ff');
  const [customAngle, setCustomAngle] = React.useState(90);
  const [showCustom, setShowCustom] = React.useState(false);
  
  const { handleAsyncError } = useErrorHandler();

  // テンプレートと要素の状態をコンテキストから取得
  const {
    selectedTemplate,
    setSelectedTemplate,
    currentText,
    setCurrentText,
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
    aspectRatio,
    customAspectRatio,
    restoreState,
  } = useTemplate();

  const selectedLayer = layers.find(layer => layer.id === selectedLayerId);

  // シャドウの有効/無効状態を同期
  React.useEffect(() => {
    if (selectedLayer && isTextLayer(selectedLayer)) {
      if (selectedLayer.textShadow && selectedLayer.textShadow !== 'none') {
        setShadowEnabled(true);
      } else {
        setShadowEnabled(false);
      }
      if (selectedLayer.textStrokeWidth && selectedLayer.textStrokeWidth !== '0px') {
        setOutlineEnabled(true);
      } else {
        setOutlineEnabled(false);
      }
      if (selectedLayer.textGradient) {
        setGradientEnabled(true);
        // グラデーションが設定されている場合、カスタム値を更新
        const parseGradient = (gradient: string) => {
          const match = gradient.match(/linear-gradient\((\d+)deg,\s*(#[0-9a-fA-F]+),\s*(#[0-9a-fA-F]+)\)/);
          if (match) {
            return { angle: parseInt(match[1]), color1: match[2], color2: match[3] };
          }
          return { angle: 90, color1: '#ff0000', color2: '#0000ff' };
        };
        const parsed = parseGradient(selectedLayer.textGradient);
        setCustomColor1(parsed.color1);
        setCustomColor2(parsed.color2);
        setCustomAngle(parsed.angle);
      } else {
        setGradientEnabled(false);
      }
    } else {
      setShadowEnabled(false);
      setOutlineEnabled(false);
      setGradientEnabled(false);
    }
  }, [selectedLayer]);

  // グリッド設定の保存/復元
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('assetCreator:grid:v1');
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.showGrid === 'boolean') setShowGrid(s.showGrid);
        if (typeof s.gridSize === 'number') setGridSize(s.gridSize);
        if (typeof s.gridColor === 'string') setGridColor(s.gridColor);
        if (typeof s.gridOpacity === 'number') setGridOpacity(s.gridOpacity);
        if (typeof s.showMajorLines === 'boolean') setShowMajorLines(s.showMajorLines);
        if (typeof s.majorInterval === 'number') setMajorInterval(s.majorInterval);
        if (typeof s.snapToGrid === 'boolean') setSnapToGrid(s.snapToGrid);
        if (typeof s.snapStrength === 'number') setSnapStrength(s.snapStrength);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      const payload = {
        showGrid,
        gridSize,
        gridColor,
        gridOpacity,
        showMajorLines,
        majorInterval,
        snapToGrid,
        snapStrength,
      };
      localStorage.setItem('assetCreator:grid:v1', JSON.stringify(payload));
    } catch {}
  }, [showGrid, gridSize, gridColor, gridOpacity, showMajorLines, majorInterval, snapToGrid, snapStrength]);


  // プレビューエリアのサイズ計算（プレビュー専用モード最大化対応）
  const getPreviewSize = React.useCallback(() => {
    if (!isDesktop) {
      // モバイル表示：画面幅を最大限活用
      if (isPreviewDedicatedMode) {
        // フルスクリーン表示時は画面幅の98%を使用（最大化）
        return { width: '98vw', maxWidth: 'none' };
      }
      // 通常表示時は画面幅の90%を使用（サイドバー分を考慮）
      return { width: '90vw', maxWidth: 'none' };
    }

    // プレビュー専用モード（最大化機能強化）
    if (isPreviewDedicatedMode) {
      // 画面サイズの最大95%を使用し、より大きなプレビューを実現
      const maxWidth = Math.min(window.innerWidth * 0.95, 2400); // 最大2400px
      const maxHeight = Math.min(window.innerHeight * 0.85, 1600); // 最大1600px
      return { 
        width: `${maxWidth}px`, 
        maxWidth: 'none',
        maxHeight: `${maxHeight}px`
      };
    }

    // サイドバーの状態に応じて動的調整
    if (isLeftSidebarOpen || isRightSidebarOpen) {
      return { width: 'min(1600px, 80vw)', maxWidth: 'none' };
    } else {
      return { width: 'min(1800px, 90vw)', maxWidth: 'none' };
    }
  }, [isDesktop, isPreviewDedicatedMode, isLeftSidebarOpen, isRightSidebarOpen]);

  // キャンバス操作機能
  const canvasOperations = useCanvasOperations(layers, selectedLayerId, restoreState);
  const {
    zoom,
    setZoom,
    addToHistory,
    saveToLocalStorage,
    loadFromLocalStorage,
    history,
    historyIndex,
    jumpToHistory,
  } = canvasOperations;

  // キーボードショートカット
  const { isShiftKeyDown, canUndo, canRedo } = useKeyboardShortcuts({ 
    canvasOperations,
    guideSettings: {
      showGrid,
      setShowGrid,
      showSafeArea,
      setShowSafeArea,
      showCenterLines,
      setShowCenterLines,
    },
  });

  // スクロール実装後のフィット最適化用マージン（将来の微調整を容易にするため定数化）
  const SAFETY = {
    ultraWide: 0.96,      // >= 2.0
    wide16_9: 0.96,       // >= 1.5
    wide4_3: 0.95,        // >= 1.2
    square: 0.90,         // >= 0.9 (1:1)
    portrait: 0.50,       // >= 0.6 (縦長)
    ultraPortrait: 0.90,  // < 0.6 (9:16含む)
  } as const;

  // アスペクト比に応じた動的安全マージン計算（スクロールなしで確実に収める）
  const calculateSafetyMarginByAspectRatio = React.useCallback((aspectRatioValue: number): number => {
    if (aspectRatioValue >= 2.0) return SAFETY.ultraWide;
    if (aspectRatioValue >= 1.5) return SAFETY.wide16_9;
    if (aspectRatioValue >= 1.2) return SAFETY.wide4_3;
    if (aspectRatioValue >= 0.9) return SAFETY.square;
    if (aspectRatioValue >= 0.6) return SAFETY.portrait;
    return SAFETY.ultraPortrait;
  }, []);

  // アスペクト比ごとの基準サイズを記憶（refで管理）
  const baseSizeRef = React.useRef<number>(400); // デフォルト400px

  // アスペクト比ごとの基準サイズを動的に計算
  const calculateBaseSize = React.useCallback(() => {
    const previewContainer = document.querySelector('[data-preview-container="true"]');
    
    if (!previewContainer) {
      return 400; // フォールバック
    }

    const containerRect = previewContainer.getBoundingClientRect();
    
    // コンテナサイズが0以下の場合は前回の値を保持
    if (containerRect.width <= 0 || containerRect.height <= 0) {
      return baseSizeRef.current; // 前回の値を保持
    }
    
    const padding = 0; // スクロールコンテナにパディングは持たせない前提（内側に付与）
    
    // アスペクト比を計算
    let aspectRatioValue: number;
    if (aspectRatio === 'custom') {
      aspectRatioValue = customAspectRatio.width / customAspectRatio.height;
    } else {
      const [w, h] = aspectRatio.split(':').map(Number);
      aspectRatioValue = w / h;
    }
    
    // アスペクト比に応じた動的安全マージンを適用
    const dynamicSafetyMargin = calculateSafetyMarginByAspectRatio(aspectRatioValue);
    const SCROLLBAR_RESERVE = 12; // スクロールバー厚み分の余白
    const availableWidth = Math.max((containerRect.width - SCROLLBAR_RESERVE) * dynamicSafetyMargin, 200);
    const availableHeight = Math.max((containerRect.height - SCROLLBAR_RESERVE) * dynamicSafetyMargin, 150);

    // 【重要】利用可能領域に完全に収まる最大サイズを計算
    let optimalWidth: number;
    let optimalHeight: number;
    
    // 幅制限での最大サイズ
    const maxWidthFromWidthLimit = availableWidth;
    const maxHeightFromWidthLimit = maxWidthFromWidthLimit / aspectRatioValue;
    
    // 高さ制限での最大サイズ
    const maxHeightFromHeightLimit = availableHeight;
    const maxWidthFromHeightLimit = maxHeightFromHeightLimit * aspectRatioValue;
    
    // 両方の制限を満たすサイズを選択
    if (maxHeightFromWidthLimit <= availableHeight) {
      optimalWidth = maxWidthFromWidthLimit;
      optimalHeight = maxHeightFromWidthLimit;
    } else {
      optimalWidth = maxWidthFromHeightLimit;
      optimalHeight = maxHeightFromHeightLimit;
    }

    // このサイズが基準サイズ（100%）
    logger.info('基準サイズ計算完了', {
      aspectRatio: aspectRatio,
      aspectRatioValue: aspectRatioValue.toFixed(2),
      optimalSize: { width: optimalWidth.toFixed(1), height: optimalHeight.toFixed(1) },
      calculatedBaseSize: optimalWidth.toFixed(1)
    }, 'calculateBaseSize');

    return optimalWidth;
  }, [aspectRatio, customAspectRatio, isDesktop, calculateSafetyMarginByAspectRatio]);

  // アスペクト比変更時に基準サイズを更新
  React.useEffect(() => {
    const newBaseSize = calculateBaseSize();
    baseSizeRef.current = newBaseSize;
    // 基準サイズが変わったので、ズームも100%に戻す
    setZoom(1.0);
  }, [aspectRatio, customAspectRatio, calculateBaseSize, setZoom]);

  // 初期マウント時およびコンテナレンダリング後の基準サイズ更新
  React.useEffect(() => {
    let retryCount = 0;
    const MAX_RETRIES = 20; // 最大20回まで再試行（約1秒）
    
    // コンテナが存在し、有効なサイズを持つまで待機
    const updateBaseSizeWhenReady = () => {
      if (retryCount >= MAX_RETRIES) {
        logger.warn('基準サイズの計算がタイムアウトしました', {}, 'updateBaseSizeWhenReady');
        return;
      }

      const previewContainer = document.querySelector('[data-preview-container="true"]');
      
      if (!previewContainer) {
        retryCount++;
        setTimeout(updateBaseSizeWhenReady, 50);
        return;
      }

      const containerRect = previewContainer.getBoundingClientRect();
      
      // コンテナサイズが有効な値になるまで待機
      if (containerRect.width <= 0 || containerRect.height <= 0) {
        retryCount++;
        setTimeout(updateBaseSizeWhenReady, 50);
        return;
      }

      // コンテナが準備できたら基準サイズを計算
      const newBaseSize = calculateBaseSize();
      // 計算結果がフォールバック値（400）より大きい場合、または前回の値と異なる場合は更新
      if (newBaseSize > 400 || (newBaseSize !== baseSizeRef.current && baseSizeRef.current === 400)) {
        baseSizeRef.current = newBaseSize;
        setZoom(1.0);
        logger.info('初期基準サイズを更新しました', { baseSize: newBaseSize }, 'updateBaseSizeWhenReady');
      }
    };

    // 初期レンダリング後に実行
    const timeoutId = setTimeout(updateBaseSizeWhenReady, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [calculateBaseSize, setZoom, isLeftSidebarOpen, isRightSidebarOpen, isPreviewDedicatedMode]);

  // 画面フィットボタンのハンドラー
  const handleFitToScreen = React.useCallback(() => {
    // 常に100%に戻す（基準サイズ = 100%）
    setZoom(1.0);
  }, [setZoom]);

  // ウィンドウリサイズ時の基準サイズ更新
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      // 【重要】リサイズ後は基準サイズを再計算し、ズームを100%に戻す
      const newBaseSize = calculateBaseSize();
      baseSizeRef.current = newBaseSize;
      // 基準サイズが変わったので、ズームも100%に戻す
      setZoom(1.0);
    };

    // デバウンス処理で頻繁なリサイズイベントを制御
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(timeoutId);
    };
  }, [calculateBaseSize, setZoom]);

  // Ctrl+マウスホイールズーム（Adobe標準準拠 + 最小10%統一 + マウス位置中心ズーム）
  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Ctrl（Windows）またはCmd（Mac）が押されている場合のみ
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        // ホイールの方向を判定（deltaY > 0 = 下方向 = ズームアウト）
        const direction = e.deltaY > 0 ? 'out' : 'in';
        
        // 業界標準のズーム刻み（最小10%統一）
        const ZOOM_PRESETS = [0.10, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0];
        const MIN_ZOOM = 0.10;
        const MAX_ZOOM = 3.0;
        
        const getNextZoomLevel = (currentZoom: number, dir: 'in' | 'out'): number => {
          if (dir === 'in') {
            const nextPreset = ZOOM_PRESETS.find(preset => preset > currentZoom);
            return nextPreset || Math.min(currentZoom + 0.25, MAX_ZOOM);
          } else {
            const prevPreset = [...ZOOM_PRESETS].reverse().find(preset => preset < currentZoom);
            return prevPreset || Math.max(currentZoom - 0.25, MIN_ZOOM);
          }
        };
        
        // マウス位置中心ズームの実装
        const previewContainer = document.querySelector('[data-preview-container="true"]') as HTMLElement;
        const previewElement = document.getElementById('thumbnail-preview') as HTMLElement;
        
        if (previewContainer && previewElement && baseSizeRef.current > 0) {
          // マウス位置中心ズーム（コールバック形式で最新のズーム値を取得）
          setZoom(prevZoom => {
            const newZoom = getNextZoomLevel(prevZoom, direction);
            
            // マウス位置を取得
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // スクロールコンテナの位置とサイズを取得
            const containerRect = previewContainer.getBoundingClientRect();
            const oldScrollLeft = previewContainer.scrollLeft;
            const oldScrollTop = previewContainer.scrollTop;
            
            // コンテナ内でのマウス相対位置を計算（ビューポート基準）
            const mouseXInContainer = mouseX - containerRect.left + oldScrollLeft;
            const mouseYInContainer = mouseY - containerRect.top + oldScrollTop;
            
            // プレビュー要素の位置とサイズを取得（スクロール位置を考慮）
            const previewRect = previewElement.getBoundingClientRect();
            const previewXInContainer = previewRect.left - containerRect.left + oldScrollLeft;
            const previewYInContainer = previewRect.top - containerRect.top + oldScrollTop;
            
            // マウス位置がプレビュー要素内のどの位置にあるかを計算
            const relativeXInPreview = mouseXInContainer - previewXInContainer;
            const relativeYInPreview = mouseYInContainer - previewYInContainer;
            
            // ズーム比率を計算
            const zoomRatio = newZoom / prevZoom;
            
            // ズーム後のプレビュー要素の新しいサイズを計算
            const oldPreviewWidth = baseSizeRef.current * prevZoom;
            const newPreviewWidth = baseSizeRef.current * newZoom;
            
            // プレビュー要素の高さも計算（アスペクト比から）
            let aspectRatioValue: number;
            if (aspectRatio === 'custom') {
              aspectRatioValue = customAspectRatio.width / customAspectRatio.height;
            } else {
              const [w, h] = aspectRatio.split(':').map(Number);
              aspectRatioValue = w / h;
            }
            const oldPreviewHeight = oldPreviewWidth / aspectRatioValue;
            const newPreviewHeight = newPreviewWidth / aspectRatioValue;
            
            // ズーム後の新しいプレビュー要素の位置（中央配置を考慮）
            // プレビュー要素は中央配置されているため、サイズ変化によって位置も変わる
            const previewCenterOffsetX = (newPreviewWidth - oldPreviewWidth) / 2;
            const previewCenterOffsetY = (newPreviewHeight - oldPreviewHeight) / 2;
            const newPreviewXInContainer = previewXInContainer - previewCenterOffsetX;
            const newPreviewYInContainer = previewYInContainer - previewCenterOffsetY;
            
            // マウス位置が視覚的に同じ位置に来るように新しいスクロール位置を計算
            // マウス位置は (newPreviewXInContainer + relativeXInPreview * zoomRatio) に来る
            // これをビューポートの (mouseX - containerRect.left) に合わせる
            const newScrollLeft = newPreviewXInContainer + (relativeXInPreview * zoomRatio) - (mouseX - containerRect.left);
            const newScrollTop = newPreviewYInContainer + (relativeYInPreview * zoomRatio) - (mouseY - containerRect.top);
            
            // 次のフレームでスクロール位置を調整（DOM更新を待つ）
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (previewContainer) {
                  previewContainer.scrollLeft = Math.max(0, newScrollLeft);
                  previewContainer.scrollTop = Math.max(0, newScrollTop);
                }
              });
            });
            
            return newZoom;
          });
        } else {
          // フォールバック: 通常のズーム（マウス位置中心なし）
          setZoom(prevZoom => getNextZoomLevel(prevZoom, direction));
        }
      }
    };

    // プレビューエリア要素にイベントリスナーを追加
    const previewElement = document.getElementById('thumbnail-preview');
    if (previewElement) {
      previewElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        previewElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, [setZoom, aspectRatio, customAspectRatio]);

  // レイヤーの変更を監視して履歴を保存
  const prevLayersRef = React.useRef(layers);
  React.useEffect(() => {
    const currentLayers = layers;
    const prevLayers = prevLayersRef.current;

    console.log('=== LAYERS EFFECT TRIGGERED ===');
    console.log('Layers effect triggered:', {
      prev: prevLayers.length,
      current: currentLayers.length,
      selectedLayerId: selectedLayerId,
      canUndo,
      canRedo,
      prevLayers: prevLayers.map(l => ({ id: l.id, type: l.type })),
      currentLayers: currentLayers.map(l => ({ id: l.id, type: l.type }))
    });

    // レイヤーの数が変わった場合（追加・削除）は履歴を保存
    if (currentLayers.length !== prevLayers.length) {
      console.log('*** LAYERS COUNT CHANGED ***');
      console.log('Layers count changed, saving to history:', {
        prev: prevLayers.length,
        current: currentLayers.length,
        selectedLayerId: selectedLayerId
      });

      // 少し遅延させてから履歴を保存（レイヤー状態の更新を待つ）
      setTimeout(() => {
        console.log('*** EXECUTING DELAYED HISTORY SAVE ***');
        addToHistory(currentLayers, selectedLayerId);
      }, 100);
    } else {
      console.log('Layers count unchanged, skipping history save');
    }

    prevLayersRef.current = currentLayers;
    console.log('=== END LAYERS EFFECT ===');
  }, [layers, selectedLayerId, addToHistory, canUndo, canRedo]);

  // デスクトップ表示時は初期状態でサイドバーを開く
  React.useEffect(() => {
    if (isDesktop) {
      setIsLeftSidebarOpen(true);
      setIsRightSidebarOpen(true);
    } else {
      setIsLeftSidebarOpen(false);
      setIsRightSidebarOpen(false);
    }
  }, [isDesktop, setIsLeftSidebarOpen, setIsRightSidebarOpen]);

  // 高度なエクスポート処理
  const handleAdvancedExport = React.useCallback(async (element: HTMLElement, settings: AssetExportSettings) => {
    setIsExporting(true);
    try {
      await handleAsyncError(async () => {
        // 解像度の計算
        let resolution = { width: 1920, height: 1080 };
        
        switch (settings.resolution) {
          case 'hd':
            resolution = { width: 1280, height: 720 };
            break;
          case 'fhd':
            resolution = { width: 1920, height: 1080 };
            break;
          case '4k':
            resolution = { width: 3840, height: 2160 };
            break;
          case 'print':
            resolution = { width: 2480, height: 3508 }; // A4 300DPI
            break;
          case 'custom':
            if (settings.customWidth && settings.customHeight) {
              resolution = { width: settings.customWidth, height: settings.customHeight };
            }
            break;
        }

        // アスペクト比の調整
        if (aspectRatio !== 'custom') {
          const [w, h] = aspectRatio.split(':').map(Number);
          if (w > 0 && h > 0) {
            const aspectValue = w / h;
            resolution.width = Math.round(resolution.height * aspectValue);
          }
        } else if (customAspectRatio.width > 0 && customAspectRatio.height > 0) {
          const aspectValue = customAspectRatio.width / customAspectRatio.height;
          resolution.width = Math.round(resolution.height * aspectValue);
        }

        // エクスポートオプション
        const exportOptions = {
          cacheBust: true,
          pixelRatio: settings.pixelRatio || 2,
          quality: settings.format === 'png' ? 1.0 : 0.9,
          backgroundColor: settings.backgroundColor || (settings.includeTransparency ? 'transparent' : '#ffffff'),
          width: resolution.width,
          height: resolution.height,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
          }
        };

        let dataUrl: string;
        let filename: string;

        // 形式に応じてエクスポート
        if (settings.format === 'png') {
          dataUrl = await toPng(element, exportOptions);
          filename = `asset-${settings.optimizeForPlatform}-${resolution.width}x${resolution.height}.png`;
        } else if (settings.format === 'jpeg') {
          const { toJpeg } = await import('html-to-image');
          dataUrl = await toJpeg(element, exportOptions);
          filename = `asset-${settings.optimizeForPlatform}-${resolution.width}x${resolution.height}.jpg`;
        } else {
          dataUrl = await toPng(element, exportOptions);
          filename = `asset-${settings.optimizeForPlatform}-${resolution.width}x${resolution.height}.png`;
        }

        // ダウンロード
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();

        toast.success(`${filename} をエクスポートしました`);
      }, `エクスポートに失敗しました`);
    } finally {
      setIsExporting(false);
    }
  }, [aspectRatio, customAspectRatio, handleAsyncError]);

  // バッチエクスポート処理
  const handleBatchExport = React.useCallback(async (element: HTMLElement, settings: AssetExportSettings) => {
    setIsExporting(true);
    try {
      // 選択されたサイズのみをフィルタリング
      const selectedSizes = settings.batchSizes.filter(size => size.selected);
      
      if (selectedSizes.length === 0) {
        toast.error('エクスポートするサイズを選択してください');
        return;
      }

      const promises = selectedSizes.map(async (size) => {
        const exportOptions = {
          cacheBust: true,
          pixelRatio: settings.pixelRatio || 2,
          quality: settings.format === 'png' ? 1.0 : 0.9,
          backgroundColor: settings.backgroundColor || (settings.includeTransparency ? 'transparent' : '#ffffff'),
          width: size.width,
          height: size.height
        };

        let dataUrl: string;
        let filename: string;

        if (settings.format === 'png') {
          dataUrl = await toPng(element, exportOptions);
          filename = `asset-${size.platform}-${size.width}x${size.height}.png`;
        } else if (settings.format === 'jpeg') {
          const { toJpeg } = await import('html-to-image');
          dataUrl = await toJpeg(element, exportOptions);
          filename = `asset-${size.platform}-${size.width}x${size.height}.jpg`;
        } else {
          dataUrl = await toPng(element, exportOptions);
          filename = `asset-${size.platform}-${size.width}x${size.height}.png`;
        }

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();

        return filename;
      });

      const filenames = await Promise.all(promises);
      toast.success(`${filenames.length}個のファイルをエクスポートしました`);
    } catch (error) {
      logger.error('Batch export failed', error, 'AssetCreator');
      toast.error('バッチエクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // サムネイルのダウンロード処理（ツールバー用）
  const handleDownloadThumbnail = React.useCallback(async (qualityLevel: 'normal' | 'high' | 'super') => {
    const element = document.getElementById('download-target');
    if (!element) {
      toast.error('プレビューエリアが見つかりません');
      return;
    }

    try {
      const settings: AssetExportSettings = {
        resolution: qualityLevel === 'super' ? '4k' : qualityLevel === 'high' ? 'fhd' : 'hd',
        quality: 'high',
        format: 'png',
        pixelRatio: qualityLevel === 'super' ? 4 : qualityLevel === 'high' ? 2 : 1,
        backgroundColor: '#ffffff',
        includeTransparency: false,
        optimizeForPlatform: 'general',
        batchExport: false,
        batchSizes: []
      };
      
      await handleAdvancedExport(element, settings);
    } catch (error) {
      logger.error('Export failed', error, 'AssetCreator');
      toast.error('エクスポートに失敗しました');
    }
  }, [handleAdvancedExport]);

  // クイックエクスポート処理（プラットフォーム別）
  const handleQuickExport = React.useCallback(async (platform: 'twitter-post' | 'twitter-header' | 'youtube-thumbnail' | 'youtube-thumbnail-hd' | 'instagram-post' | 'instagram-story') => {
    const element = document.getElementById('download-target');
    if (!element) {
      toast.error('プレビューエリアが見つかりません');
      return;
    }

    try {
      const platformSettings: Record<typeof platform, { width: number; height: number; pixelRatio: number; format: 'png' | 'jpeg' }> = {
        'twitter-post': { width: 1200, height: 675, pixelRatio: 2, format: 'png' },
        'twitter-header': { width: 1500, height: 500, pixelRatio: 2, format: 'png' },
        'youtube-thumbnail': { width: 1280, height: 720, pixelRatio: 2, format: 'png' },
        'youtube-thumbnail-hd': { width: 1920, height: 1080, pixelRatio: 2, format: 'png' },
        'instagram-post': { width: 1080, height: 1080, pixelRatio: 2, format: 'png' },
        'instagram-story': { width: 1080, height: 1920, pixelRatio: 2, format: 'png' },
      };

      const config = platformSettings[platform];
      const settings: AssetExportSettings = {
        resolution: 'custom',
        customWidth: config.width,
        customHeight: config.height,
        quality: 'high',
        format: config.format,
        pixelRatio: config.pixelRatio,
        backgroundColor: '#ffffff',
        includeTransparency: false,
        optimizeForPlatform: platform.startsWith('twitter') ? 'social' : platform.startsWith('youtube') ? 'social' : 'social',
        batchExport: false,
        batchSizes: []
      };
      
      await handleAdvancedExport(element, settings);
    } catch (error) {
      logger.error('Quick export failed', error, 'AssetCreator');
      toast.error('エクスポートに失敗しました');
    }
  }, [handleAdvancedExport]);

  // レイヤーのドラッグ＆リサイズハンドラー
  const handleLayerDragStop = React.useCallback((id: string, _: unknown, d: Position) => {
    let x = d.x;
    let y = d.y;
    if (snapToGrid) {
      const step = gridSize;
      const sx = Math.round(x / step) * step;
      const sy = Math.round(y / step) * step;
      if (Math.abs(sx - x) <= snapStrength) x = sx;
      if (Math.abs(sy - y) <= snapStrength) y = sy;
    }
    updateLayer(id, { x, y });
    // 履歴はuseEffectで管理
  }, [updateLayer, snapToGrid, gridSize, snapStrength]);

  const handleLayerResize = React.useCallback((id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    updateLayer(id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
    // 履歴はuseEffectで管理
  }, [updateLayer]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`ファイルサイズが大きすぎます: ${file.name}`, {
          description: `10MB以下のファイルを選択してください。`,
        });
        continue;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`ファイル形式が無効です: ${file.name}`, {
          description: "JPEG, PNG, WEBP形式の画像ファイルを選択してください。",
        });
        continue;
      }
      const src = URL.createObjectURL(file);
      addLayer({
        type: 'image',
        name: file.name,
        visible: true,
        locked: false,
        x: isDesktop ? 550 : 50,
        y: isDesktop ? 250 : 50,
        width: isDesktop ? 300 : 150,
        height: isDesktop ? 300 : 150,
        src,
      } as any);
    }
    e.target.value = '';
  };

  const handleAddShape = (shapeType: ShapeType) => {
    const offset = layers.filter(l => l.type === 'shape').length * (isDesktop ? 20 : 5);
    const shapeCount = layers.filter(l => l.type === 'shape' && 'shapeType' in l && l.shapeType === shapeType).length + 1;
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
      case 'triangle': name = `三角 ${shapeCount}`; break;
      case 'line': name = `線 ${shapeCount}`; break;
      case 'arrow': name = `矢印 ${shapeCount}`; break;
      case 'star': name = `星 ${shapeCount}`; break;
      case 'polygon': name = `多角形 ${shapeCount}`; break;
      case 'heart': name = `ハート ${shapeCount}`; break;
      case 'diamond': name = `ダイヤ ${shapeCount}`; break;
      case 'dashed-line': name = `点線 ${shapeCount}`; break;
      case 'dotted-line': name = `点線 ${shapeCount}`; break;
      case 'wavy-line': name = `波線 ${shapeCount}`; break;
      case 'speech-bubble-round': name = `吹き出し ${shapeCount}`; break;
      case 'speech-bubble-square': name = `吹き出し(角) ${shapeCount}`; break;
      case 'thought-bubble': name = `思考バブル ${shapeCount}`; break;
      case 'badge': name = `バッジ ${shapeCount}`; break;
      case 'ribbon': name = `リボン ${shapeCount}`; break;
      default: name = `図形 ${shapeCount}`; break;
    }

    addLayer({
      type: 'shape',
      shapeType,
      name,
      visible: true,
      locked: false,
      x: initialX + offset,
      y: initialY + offset,
      width: (shapeType === 'line' || shapeType === 'arrow' || shapeType === 'dashed-line' || shapeType === 'dotted-line' || shapeType === 'wavy-line') ? lineArrowWidth : initialWidth,
      height: (shapeType === 'line' || shapeType === 'arrow' || shapeType === 'dashed-line' || shapeType === 'dotted-line' || shapeType === 'wavy-line') ? lineArrowHeight : initialHeight,
      backgroundColor: '#cccccc',
      borderColor: '#000000',
      borderWidth: initialBorderWidth,
    } as any);
    // 履歴はuseEffectで管理
  };

  const handleAddText = () => {
    addLayer({
      type: 'text',
      name: `テキスト ${layers.filter(l => l.type === 'text').length + 1}`,
      visible: true,
      locked: false,
      x: isDesktop ? 550 : 50,
      y: isDesktop ? 250 : 50,
      width: isDesktop ? 300 : 150,
      height: isDesktop ? 100 : 50,
      text: currentText,
      color: '#000000',
      fontSize: isDesktop ? '2rem' : '1rem',
    } as any);
    // 履歴はuseEffectで管理
  };

  // 保存機能
  const handleSave = React.useCallback(() => {
    const saved = saveToLocalStorage(layers, selectedLayerId);
    if (saved) {
      toast.success('プロジェクトを保存しました');
    } else {
      toast.error('保存に失敗しました');
    }
  }, [saveToLocalStorage, layers, selectedLayerId]);

  // ツールバー用のUndo/Redoハンドラー（toastメッセージ付き）
  const handleToolbarUndo = React.useCallback(() => {
    console.log('Toolbar undo button clicked');
    const result = canvasOperations.undo();
    if (result) {
      toast.success('元に戻しました');
    } else {
      console.log('Undo failed - no history to undo');
    }
  }, [canvasOperations.undo]);

  const handleToolbarRedo = React.useCallback(() => {
    console.log('Toolbar redo button clicked');
    const result = canvasOperations.redo();
    if (result) {
      toast.success('やり直しました');
    } else {
      console.log('Redo failed - no history to redo');
    }
  }, [canvasOperations.redo]);

  if (!selectedTemplate) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#A0A0A0] mb-4 animate-spin mx-auto" aria-hidden="true" />
          <p className="text-[#E0E0E0] text-lg font-semibold">テンプレートを読み込み中...</p>
          <p className="text-[#A0A0A0] mt-2">しばらくお待ちください。</p>
        </div>
      </div>
    );
  }

  const renderToolsPanel = () => (
    <div className="space-y-6">
      {/* 基本情報 */}
      <div className="space-y-4">
        <h4 className="font-medium">基本情報</h4>
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">レイヤー名</Label>
            <Input
              value={selectedLayer?.name || ''}
              onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { name: e.target.value })}
              className="mt-1"
              placeholder="レイヤー名を入力"
              disabled={!selectedLayer}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">X座標</Label>
              <Input
                type="number"
                value={selectedLayer?.x || 0}
                onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Y座標</Label>
              <Input
                type="number"
                value={selectedLayer?.y || 0}
                onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">幅</Label>
              <Input
                type="number"
                value={selectedLayer?.width || 0}
                onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { width: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">高さ</Label>
              <Input
                type="number"
                value={selectedLayer?.height || 0}
                onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { height: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
          </div>
        </div>
      </div>

      {/* テキストレイヤーの設定 */}
      {selectedLayer && isTextLayer(selectedLayer) && (
        <div className="space-y-4">
          <h4 className="font-medium">テキスト設定</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">テキスト</Label>
              <Textarea
                value={selectedLayer.text || ''}
                onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                className="mt-1 min-h-[80px] resize-none"
                placeholder="テキストを入力してください"
              />
            </div>

            {/* フォント設定 */}
            <div className="space-y-3 pt-2 border-t border-[#4A4A4A]">
              <h5 className="text-sm font-medium text-[#E0E0E0]">フォント設定</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-[#A0A0A0]">フォントファミリー</Label>
                  <FontSelector
                    value={selectedLayer.fontFamily || 'Arial, sans-serif'}
                    onValueChange={(value) => updateLayer(selectedLayer.id, { fontFamily: value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#A0A0A0]">フォントウェイト</Label>
                  <Select
                    value={selectedLayer.fontWeight || 'normal'}
                    onValueChange={(value) => updateLayer(selectedLayer.id, { fontWeight: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">通常</SelectItem>
                      <SelectItem value="bold">太字</SelectItem>
                      <SelectItem value="lighter">細字</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="300">300</SelectItem>
                      <SelectItem value="400">400</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="600">600</SelectItem>
                      <SelectItem value="700">700</SelectItem>
                      <SelectItem value="800">800</SelectItem>
                      <SelectItem value="900">900</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-[#A0A0A0]">フォントスタイル</Label>
                  <Select
                    value={selectedLayer.fontStyle || 'normal'}
                    onValueChange={(value) => updateLayer(selectedLayer.id, { fontStyle: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">通常</SelectItem>
                      <SelectItem value="italic">イタリック</SelectItem>
                      <SelectItem value="oblique">斜体</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-[#A0A0A0]">文字装飾</Label>
                  <Select
                    value={selectedLayer.textDecoration || 'none'}
                    onValueChange={(value) => updateLayer(selectedLayer.id, { textDecoration: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">なし</SelectItem>
                      <SelectItem value="underline">下線</SelectItem>
                      <SelectItem value="line-through">取り消し線</SelectItem>
                      <SelectItem value="overline">上線</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* サイズ設定 */}
            <div className="space-y-3 pt-2 border-t border-[#4A4A4A]">
              <h5 className="text-sm font-medium text-[#E0E0E0]">サイズ設定</h5>
              <div>
                <Label className="text-xs text-[#A0A0A0]">フォントサイズ</Label>
                <Slider
                  value={[parseFloat(selectedLayer.fontSize?.replace('rem', '') || '2')]}
                  onValueChange={([value]) => updateLayer(selectedLayer.id, { fontSize: `${value}rem` })}
                  min={0.5}
                  max={8}
                  step={0.1}
                  className="mt-2"
                />
                <div className="text-xs text-[#A0A0A0] text-center mt-1">
                  {selectedLayer.fontSize || '2rem'}
                </div>
              </div>
              <div>
                <Label className="text-xs text-[#A0A0A0]">文字間隔</Label>
                <Slider
                  value={[parseFloat(selectedLayer.letterSpacing?.replace('px', '') || '0')]}
                  onValueChange={([value]) => updateLayer(selectedLayer.id, { letterSpacing: `${value}px` })}
                  min={-10}
                  max={20}
                  step={0.5}
                  className="mt-2"
                />
                <div className="text-xs text-[#A0A0A0] text-center mt-1">
                  {selectedLayer.letterSpacing || '0px'}
                </div>
              </div>
            </div>

            {/* 色・効果 */}
            <div className="space-y-3 pt-2 border-t border-[#4A4A4A]">
              <h5 className="text-sm font-medium text-[#E0E0E0]">色・効果</h5>
              
              {/* グラデーション */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-[#A0A0A0]">グラデーション</Label>
                  <Button
                    size="sm"
                    variant={gradientEnabled ? "default" : "outline"}
                    onClick={() => {
                      const newEnabled = !gradientEnabled;
                      setGradientEnabled(newEnabled);
                      if (!newEnabled) {
                        updateLayer(selectedLayer.id, { textGradient: undefined });
                      } else {
                        updateLayer(selectedLayer.id, { textGradient: 'linear-gradient(90deg, #ff0000, #0000ff)' });
                      }
                    }}
                    className="h-6 px-3 text-xs"
                  >
                    {gradientEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                
                {gradientEnabled && (() => {
                  // よく使うグラデーションプリセット
                  const gradientPresets = [
                    { name: '虹', gradient: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)' },
                    { name: '金', gradient: 'linear-gradient(135deg, #ffd700, #ffed4e)' },
                    { name: '銀', gradient: 'linear-gradient(135deg, #c0c0c0, #ffffff)' },
                    { name: '紅白', gradient: 'linear-gradient(90deg, #ff6b9d, #ffffff)' },
                    { name: '青→白', gradient: 'linear-gradient(90deg, #4169e1, #87ceeb)' },
                    { name: '紫→ピンク', gradient: 'linear-gradient(90deg, #9b59b6, #e91e63)' },
                    { name: 'オレンジ→ピンク', gradient: 'linear-gradient(90deg, #ff8c00, #ff69b4)' },
                    { name: '緑→青', gradient: 'linear-gradient(90deg, #00ff7f, #00ced1)' },
                  ];

                  const applyCustomGradient = () => {
                    updateLayer(selectedLayer.id, { 
                      textGradient: `linear-gradient(${customAngle}deg, ${customColor1}, ${customColor2})` 
                    });
                  };

                  return (
                    <div className="pl-2 border-l-2 border-[#4A4A4A] space-y-3">
                      {/* プリセット */}
                      <div>
                        <Label className="text-xs text-[#A0A0A0]">プリセット</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {gradientPresets.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => {
                                updateLayer(selectedLayer.id, { textGradient: preset.gradient });
                                setShowCustom(false);
                              }}
                              className="h-8 rounded border border-[#4A4A4A] hover:border-[#808080] transition-colors text-[10px] relative overflow-hidden group"
                              style={{
                                background: preset.gradient,
                              }}
                              title={preset.name}
                            >
                              <span className="relative z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                {preset.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* カスタム */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-[#A0A0A0]">カスタム</Label>
                          <Button
                            size="sm"
                            variant={showCustom ? "default" : "outline"}
                            onClick={() => setShowCustom(!showCustom)}
                            className="h-6 px-3 text-xs"
                          >
                            {showCustom ? '閉じる' : '開く'}
                          </Button>
                        </div>
                        
                        {showCustom && (
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs text-[#A0A0A0]">開始色</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="color"
                                  value={customColor1}
                                  onChange={(e) => setCustomColor1(e.target.value)}
                                  className="w-8 h-7 rounded border border-[#4A4A4A]"
                                />
                                <Input
                                  value={customColor1}
                                  onChange={(e) => setCustomColor1(e.target.value)}
                                  className="flex-1 h-7 text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-[#A0A0A0]">終了色</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="color"
                                  value={customColor2}
                                  onChange={(e) => setCustomColor2(e.target.value)}
                                  className="w-8 h-7 rounded border border-[#4A4A4A]"
                                />
                                <Input
                                  value={customColor2}
                                  onChange={(e) => setCustomColor2(e.target.value)}
                                  className="flex-1 h-7 text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-[#A0A0A0]">方向</Label>
                              <Select
                                value={customAngle.toString()}
                                onValueChange={(value) => setCustomAngle(parseInt(value))}
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">→ 横</SelectItem>
                                  <SelectItem value="90">↓ 縦</SelectItem>
                                  <SelectItem value="135">↘ 斜め右下</SelectItem>
                                  <SelectItem value="45">↗ 斜め右上</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              onClick={applyCustomGradient}
                              size="sm"
                              className="w-full h-7 text-xs"
                            >
                              適用
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* 詳細設定（CSS手入力） */}
                      <details className="text-xs">
                        <summary className="text-[#A0A0A0] cursor-pointer hover:text-[#E0E0E0]">
                          詳細設定（CSS手入力）
                        </summary>
                        <div className="mt-2">
                          <Input
                            value={selectedLayer.textGradient || ''}
                            onChange={(e) => updateLayer(selectedLayer.id, { textGradient: e.target.value })}
                            className="h-7 text-xs"
                            placeholder="linear-gradient(90deg, #ff0000, #0000ff)"
                          />
                          <div className="text-[10px] text-[#808080] mt-1">
                            例: linear-gradient(90deg, #ff0000, #0000ff)
                          </div>
                        </div>
                      </details>
                    </div>
                  );
                })()}
              </div>

              {/* 通常の色（グラデーション無効時のみ表示） */}
              {!gradientEnabled && (
                <div>
                  <Label className="text-xs text-[#A0A0A0]">色</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={selectedLayer.color || '#ffffff'}
                      onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                      className="w-8 h-8 rounded border border-[#4A4A4A]"
                    />
                    <Input
                      value={selectedLayer.color || '#ffffff'}
                      onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {/* アウトライン */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-[#A0A0A0]">アウトライン</Label>
                  <Button
                    size="sm"
                    variant={outlineEnabled ? "default" : "outline"}
                    onClick={() => {
                      const newEnabled = !outlineEnabled;
                      setOutlineEnabled(newEnabled);
                      if (!newEnabled) {
                        updateLayer(selectedLayer.id, { textStrokeWidth: '0px' });
                      } else {
                        updateLayer(selectedLayer.id, { textStrokeWidth: '2px', textStrokeColor: '#000000' });
                      }
                    }}
                    className="h-6 px-3 text-xs"
                  >
                    {outlineEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                
                {outlineEnabled && (
                  <div className="space-y-2 pl-2 border-l-2 border-[#4A4A4A]">
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">太さ</Label>
                      <Slider
                        value={[parseFloat(selectedLayer.textStrokeWidth?.replace('px', '') || '2')]}
                        onValueChange={([value]) => updateLayer(selectedLayer.id, { textStrokeWidth: `${value}px` })}
                        min={0.5}
                        max={20}
                        step={0.5}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {selectedLayer.textStrokeWidth || '2px'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">色</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="color"
                          value={selectedLayer.textStrokeColor || '#000000'}
                          onChange={(e) => updateLayer(selectedLayer.id, { textStrokeColor: e.target.value })}
                          className="w-8 h-7 rounded border border-[#4A4A4A]"
                        />
                        <Input
                          value={selectedLayer.textStrokeColor || '#000000'}
                          onChange={(e) => updateLayer(selectedLayer.id, { textStrokeColor: e.target.value })}
                          className="flex-1 h-7 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 文字シャドウ - ビジュアルエディタ */}
            <div className="space-y-3 pt-2 border-t border-[#4A4A4A]">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-[#A0A0A0]">文字シャドウ</Label>
                <Button
                  size="sm"
                  variant={shadowEnabled ? "default" : "outline"}
                  onClick={() => {
                    const newEnabled = !shadowEnabled;
                    setShadowEnabled(newEnabled);
                    if (!newEnabled) {
                      updateLayer(selectedLayer.id, { textShadow: 'none' });
                    } else {
                      updateLayer(selectedLayer.id, { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' });
                    }
                  }}
                  className="h-6 px-3 text-xs"
                >
                  {shadowEnabled ? 'ON' : 'OFF'}
                </Button>
              </div>
              
              {shadowEnabled && (() => {
                const shadow = parseTextShadow(selectedLayer.textShadow);
                const handleShadowChange = (param: 'x' | 'y' | 'blur' | 'color' | 'opacity', value: number | string) => {
                  const current = parseTextShadow(selectedLayer.textShadow);
                  const updated = { ...current, [param]: value };
                  const newShadow = buildTextShadow(updated.x, updated.y, updated.blur, updated.color, updated.opacity);
                  updateLayer(selectedLayer.id, { textShadow: newShadow });
                };
                
                return (
                  <div className="space-y-3 pl-2 border-l-2 border-[#4A4A4A]">
                    {/* 水平位置 */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">水平位置（X）</Label>
                      <Slider
                        value={[shadow.x]}
                        onValueChange={([value]) => handleShadowChange('x', value)}
                        min={-20}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {shadow.x}px
                      </div>
                    </div>
                    
                    {/* 垂直位置 */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">垂直位置（Y）</Label>
                      <Slider
                        value={[shadow.y]}
                        onValueChange={([value]) => handleShadowChange('y', value)}
                        min={-20}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {shadow.y}px
                      </div>
                    </div>
                    
                    {/* ぼかし */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">ぼかし</Label>
                      <Slider
                        value={[shadow.blur]}
                        onValueChange={([value]) => handleShadowChange('blur', value)}
                        min={0}
                        max={30}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {shadow.blur}px
                      </div>
                    </div>
                    
                    {/* 影の色 */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">影の色</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="color"
                          value={shadow.color}
                          onChange={(e) => handleShadowChange('color', e.target.value)}
                          className="w-10 h-8 rounded border border-[#4A4A4A]"
                        />
                        <Input
                          value={shadow.color}
                          onChange={(e) => handleShadowChange('color', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    
                    {/* 不透明度 */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">不透明度</Label>
                      <Slider
                        value={[shadow.opacity * 100]}
                        onValueChange={([value]) => handleShadowChange('opacity', value / 100)}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {Math.round(shadow.opacity * 100)}%
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 画像レイヤーの設定 */}
      {selectedLayer && isImageLayer(selectedLayer) && (
        <div className="space-y-4">
          <h4 className="font-medium">画像設定</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">画像を変更</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const src = URL.createObjectURL(file);
                    updateLayer(selectedLayer.id, { src });
                  }
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">不透明度</Label>
              <Slider
                value={[selectedLayer.opacity || 100]}
                onValueChange={([value]) => updateLayer(selectedLayer.id, { opacity: value })}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-[#A0A0A0] text-center mt-1">
                {selectedLayer.opacity || 100}%
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">回転角度</Label>
              <Slider
                value={[selectedLayer.rotation || 0]}
                onValueChange={([value]) => updateLayer(selectedLayer.id, { rotation: value })}
                min={-180}
                max={180}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-[#A0A0A0] text-center mt-1">
                {selectedLayer.rotation || 0}°
              </div>
            </div>
            
            {/* 画像フィルター・エフェクト */}
            <div className="space-y-3 pt-2 border-t border-[#3A3A3A]">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">フィルター・エフェクト</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-[#A0A0A0] hover:text-[#E0E0E0]"
                  onClick={() => {
                    const currentFilters = selectedLayer.imageFilters;
                    if (currentFilters?.enabled) {
                      updateLayer(selectedLayer.id, {
                        imageFilters: { ...currentFilters, enabled: false },
                      });
                    } else {
                      const defaultFilters: ImageFilters = {
                        brightness: 100,
                        contrast: 100,
                        saturate: 100,
                        hueRotate: 0,
                        sepia: 0,
                        grayscale: 0,
                        blur: 0,
                        enabled: true,
                      };
                      updateLayer(selectedLayer.id, {
                        imageFilters: currentFilters ? { ...currentFilters, enabled: true } : defaultFilters,
                      });
                    }
                  }}
                >
                  {selectedLayer.imageFilters?.enabled ? 'OFF' : 'ON'}
                </Button>
              </div>
              
              {selectedLayer.imageFilters?.enabled && (
                <div className="space-y-3">
                  {/* プリセット */}
                  <div>
                    <Label className="text-xs text-[#A0A0A0] mb-2 block">雰囲気プリセット</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.keys(FILTER_PRESETS).filter(key => key !== 'none').map((presetName) => {
                        const preset = FILTER_PRESETS[presetName];
                        const isActive = selectedLayer.imageFilters?.preset === presetName;
                        return (
                          <button
                            key={presetName}
                            type="button"
                            onClick={() => {
                              const applied = applyPreset(presetName);
                              updateLayer(selectedLayer.id, { imageFilters: applied });
                            }}
                            className={cn(
                              "px-2 py-1.5 text-xs rounded border transition-colors",
                              isActive
                                ? "bg-[#20B2AA]/20 border-[#20B2AA] text-[#E0E0E0]"
                                : "bg-[#2D2D2D] border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#3A3A3A]"
                            )}
                            title={presetName === 'soft' ? 'ソフト' : presetName === 'cool' ? 'クール' : presetName === 'pop' ? 'ポップ' : presetName === 'monochrome' ? 'モノクロ' : presetName === 'sepia' ? 'セピア' : presetName}
                          >
                            {presetName === 'soft' ? 'ソフト' : presetName === 'cool' ? 'クール' : presetName === 'pop' ? 'ポップ' : presetName === 'monochrome' ? 'モノクロ' : presetName === 'sepia' ? 'セピア' : presetName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* 基本調整 */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[#A0A0A0]">基本調整</Label>
                    
                    {/* 明るさ */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">明るさ</Label>
                      <Slider
                        value={[selectedLayer.imageFilters?.brightness ?? 100]}
                        onValueChange={([value]) => {
                          const current = selectedLayer.imageFilters || {};
                          updateLayer(selectedLayer.id, {
                            imageFilters: { ...current, brightness: value, enabled: true, preset: 'custom' },
                          });
                        }}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {selectedLayer.imageFilters?.brightness ?? 100}%
                      </div>
                    </div>
                    
                    {/* コントラスト */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">コントラスト</Label>
                      <Slider
                        value={[selectedLayer.imageFilters?.contrast ?? 100]}
                        onValueChange={([value]) => {
                          const current = selectedLayer.imageFilters || {};
                          updateLayer(selectedLayer.id, {
                            imageFilters: { ...current, contrast: value, enabled: true, preset: 'custom' },
                          });
                        }}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {selectedLayer.imageFilters?.contrast ?? 100}%
                      </div>
                    </div>
                    
                    {/* 彩度 */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">彩度</Label>
                      <Slider
                        value={[selectedLayer.imageFilters?.saturate ?? 100]}
                        onValueChange={([value]) => {
                          const current = selectedLayer.imageFilters || {};
                          updateLayer(selectedLayer.id, {
                            imageFilters: { ...current, saturate: value, enabled: true, preset: 'custom' },
                          });
                        }}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {selectedLayer.imageFilters?.saturate ?? 100}%
                      </div>
                    </div>
                  </div>
                  
                  {/* 雰囲気調整 */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[#A0A0A0]">雰囲気調整</Label>
                    
                    {/* 色相回転 */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">色相</Label>
                      <Slider
                        value={[selectedLayer.imageFilters?.hueRotate ?? 0]}
                        onValueChange={([value]) => {
                          const current = selectedLayer.imageFilters || {};
                          updateLayer(selectedLayer.id, {
                            imageFilters: { ...current, hueRotate: value, enabled: true, preset: 'custom' },
                          });
                        }}
                        min={0}
                        max={360}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {selectedLayer.imageFilters?.hueRotate ?? 0}°
                      </div>
                    </div>
                    
                    {/* セピア */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">セピア</Label>
                      <Slider
                        value={[selectedLayer.imageFilters?.sepia ?? 0]}
                        onValueChange={([value]) => {
                          const current = selectedLayer.imageFilters || {};
                          updateLayer(selectedLayer.id, {
                            imageFilters: { ...current, sepia: value, enabled: true, preset: 'custom' },
                          });
                        }}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {selectedLayer.imageFilters?.sepia ?? 0}%
                      </div>
                    </div>
                    
                    {/* モノクロ */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">モノクロ</Label>
                      <Slider
                        value={[selectedLayer.imageFilters?.grayscale ?? 0]}
                        onValueChange={([value]) => {
                          const current = selectedLayer.imageFilters || {};
                          updateLayer(selectedLayer.id, {
                            imageFilters: { ...current, grayscale: value, enabled: true, preset: 'custom' },
                          });
                        }}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {selectedLayer.imageFilters?.grayscale ?? 0}%
                      </div>
                    </div>
                    
                    {/* ぼかし（軽め） */}
                    <div>
                      <Label className="text-xs text-[#A0A0A0]">ぼかし</Label>
                      <Slider
                        value={[selectedLayer.imageFilters?.blur ?? 0]}
                        onValueChange={([value]) => {
                          const current = selectedLayer.imageFilters || {};
                          updateLayer(selectedLayer.id, {
                            imageFilters: { ...current, blur: value, enabled: true, preset: 'custom' },
                          });
                        }}
                        min={0}
                        max={10}
                        step={0.1}
                        className="mt-2"
                      />
                      <div className="text-xs text-[#A0A0A0] text-center mt-1">
                        {selectedLayer.imageFilters?.blur ? selectedLayer.imageFilters.blur.toFixed(1) : '0.0'}px
                      </div>
                    </div>
                  </div>
                  
                  {/* リセットボタン */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={() => {
                      updateLayer(selectedLayer.id, {
                        imageFilters: FILTER_PRESETS.none,
                      });
                    }}
                  >
                    リセット
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 図形レイヤーの設定 */}
      {selectedLayer && isShapeLayer(selectedLayer) && (
        <div className="space-y-4">
          <h4 className="font-medium">図形設定</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">図形の種類</Label>
              <div className="mt-2">
                <ShapeTypeSelector
                  value={selectedLayer.shapeType || 'rectangle'}
                  onChange={(shape) => updateLayer(selectedLayer.id, { shapeType: shape })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">塗りつぶし色</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={selectedLayer.backgroundColor || '#000000'}
                    onChange={(e) => updateLayer(selectedLayer.id, { backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-[#4A4A4A]"
                  />
                  <Input
                    value={selectedLayer.backgroundColor || '#000000'}
                    onChange={(e) => updateLayer(selectedLayer.id, { backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">境界線色</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={selectedLayer.borderColor || '#000000'}
                    onChange={(e) => updateLayer(selectedLayer.id, { borderColor: e.target.value })}
                    className="w-8 h-8 rounded border border-[#4A4A4A]"
                  />
                  <Input
                    value={selectedLayer.borderColor || '#000000'}
                    onChange={(e) => updateLayer(selectedLayer.id, { borderColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">境界線の太さ</Label>
              <Slider
                value={[selectedLayer.borderWidth || 0]}
                onValueChange={([value]) => updateLayer(selectedLayer.id, { borderWidth: value })}
                min={0}
                max={20}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-[#A0A0A0] text-center mt-1">
                {selectedLayer.borderWidth || 0}px
              </div>
            </div>
          </div>
        </div>
      )}

      {/* プレビュー設定（デスクトップ右ペイン用） */}
      <div className="space-y-4 pt-2 border-t border-[#4A4A4A]" id="grid-settings">
        <h4 className="font-medium">プレビュー設定</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">グリッド表示</Label>
            <Button
              size="sm"
              variant={showGrid ? "default" : "outline"}
              onClick={() => setShowGrid(!showGrid)}
              className="h-7 px-3 text-xs"
            >
              {showGrid ? 'ON' : 'OFF'}
            </Button>
          </div>
          {showGrid && (
            <div className="space-y-3 pl-2 border-l">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">グリッドサイズ</Label>
                <div className="flex gap-1">
                  {[10,20,40].map(n => (
                    <Button key={n} size="sm" variant={gridSize===n?"default":"outline"} onClick={() => setGridSize(n)} className="h-7 px-2 text-xs">{n}px</Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-20">色</Label>
                <input
                  type="color"
                  value={(function(){try{const m=gridColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),/);if(m){const r=parseInt(m[1],10),g=parseInt(m[2],10),b=parseInt(m[3],10);const hx=(x:number)=>x.toString(16).padStart(2,'0');return `#${hx(r)}${hx(g)}${hx(b)}`}}catch(e){}return '#88daff';})()}
                  onChange={(e)=>{const hex=e.target.value;const r=parseInt(hex.slice(1,3),16);const g=parseInt(hex.slice(3,5),16);const b=parseInt(hex.slice(5,7),16);setGridColor(`rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, gridOpacity))})`);}}
                  className="w-8 h-7 rounded border"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">不透明度</Label>
                <Slider
                  value={[Math.round(gridOpacity*100)]}
                  onValueChange={([v])=>setGridOpacity(v/100)}
                  min={10}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground text-center mt-1">{Math.round(gridOpacity*100)}%</div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">主要線</Label>
                <Button size="sm" variant={showMajorLines?"default":"outline"} onClick={()=>setShowMajorLines(!showMajorLines)} className="h-7 px-3 text-xs">{showMajorLines?"ON":"OFF"}</Button>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">主要線の間隔</Label>
                <div className="flex gap-1 mt-1">
                  {[3,5,10].map(n => (
                    <Button key={n} size="sm" variant={majorInterval===n?"default":"outline"} onClick={()=>setMajorInterval(n)} className="h-7 px-2 text-xs">{n}</Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">スナップ</Label>
                <Button size="sm" variant={snapToGrid?"default":"outline"} onClick={()=>setSnapToGrid(!snapToGrid)} className="h-7 px-3 text-xs">{snapToGrid?"ON":"OFF"}</Button>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">スナップ強度</Label>
                <div className="flex gap-1 mt-1">
                  {[0,4,8,16].map(n => (
                    <Button key={n} size="sm" variant={snapStrength===n?"default":"outline"} onClick={()=>setSnapStrength(n)} className="h-7 px-2 text-xs">{n}px</Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* レイヤーが選択されていない場合 */}
      {!selectedLayer && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">レイヤーを選択してください</p>
          <p className="text-xs text-muted-foreground mt-1">レイヤーパネルからレイヤーを選択すると、ここで詳細設定ができます</p>
        </div>
      )}
    </div>
  );


  const renderMobileControls = () => (
    <div className="p-2 lg:p-4 space-y-3">
      {/* モバイル用クイックアクション */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">クイックアクセス</h4>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="w-full h-12 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground">
            <TabsTrigger 
              value="tools"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              ツール設定
            </TabsTrigger>
            <TabsTrigger 
              value="layers"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              レイヤー管理
            </TabsTrigger>
            <TabsTrigger 
              value="edit"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              レイヤー編集
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              プレビュー
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* インライン表示エリア */}
      {selectedTab === "tools" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">ツール設定</h4>
          {renderToolsPanel()}
        </div>
      )}
      
      {selectedTab === "layers" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">レイヤー管理</h4>
          <UnifiedLayerPanel 
            context={{
              layers,
              updateLayer,
              removeLayer,
              selectedLayerId,
              setSelectedLayerId,
              reorderLayers,
              duplicateLayer,
              addLayer,
              moveLayerUp,
              moveLayerDown,
            }}
            onShapeSelect={(shapeType) => handleAddShape(shapeType as ShapeType)}
            showShapeSelector={true}
          />
        </div>
      )}
      
      {selectedTab === "edit" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">レイヤー編集</h4>
          {selectedLayer ? (
            <div className="space-y-3">
              {/* 選択中レイヤー情報 */}
              <div className="p-2 bg-secondary/50 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">選択中</p>
                <p className="text-sm font-medium truncate" title={selectedLayer.name}>
                  {selectedLayer.name.length > 15 ? selectedLayer.name.substring(0, 12) + '...' : selectedLayer.name}
                </p>
              </div>
              
              {/* 位置調整 */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">📐 位置</Label>
                <div className="space-y-2">
                  {/* X座標 */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (typeof selectedLayer.x === 'number') {
                          updateLayer(selectedLayer.id, { x: selectedLayer.x - 10 });
                        }
                      }}
                      className="h-7 w-7 p-0"
                    >
                      ←
                    </Button>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">X</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={typeof selectedLayer.x === 'number' ? Math.round(selectedLayer.x) : 0}
                        onChange={(e) => updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                        className="h-7 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (typeof selectedLayer.x === 'number') {
                          updateLayer(selectedLayer.id, { x: selectedLayer.x + 10 });
                        }
                      }}
                      className="h-7 w-7 p-0"
                    >
                      →
                    </Button>
                  </div>
                  
                  {/* Y座標 */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (typeof selectedLayer.y === 'number') {
                          updateLayer(selectedLayer.id, { y: selectedLayer.y - 10 });
                        }
                      }}
                      className="h-7 w-7 p-0"
                    >
                      ↑
                    </Button>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Y</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={typeof selectedLayer.y === 'number' ? Math.round(selectedLayer.y) : 0}
                        onChange={(e) => updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                        className="h-7 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (typeof selectedLayer.y === 'number') {
                          updateLayer(selectedLayer.id, { y: selectedLayer.y + 10 });
                        }
                      }}
                      className="h-7 w-7 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* サイズ調整 */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">📏 サイズ</Label>
                <div className="space-y-2">
                  {/* 幅 */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (typeof selectedLayer.width === 'number') {
                          updateLayer(selectedLayer.id, { width: Math.max(10, selectedLayer.width - 20) });
                        }
                      }}
                      className="h-7 w-7 p-0"
                    >
                      −
                    </Button>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">幅</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={typeof selectedLayer.width === 'number' ? Math.round(selectedLayer.width) : 0}
                        onChange={(e) => updateLayer(selectedLayer.id, { width: Math.max(10, Number(e.target.value)) })}
                        className="h-7 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (typeof selectedLayer.width === 'number') {
                          updateLayer(selectedLayer.id, { width: selectedLayer.width + 20 });
                        }
                      }}
                      className="h-7 w-7 p-0"
                    >
                      +
                    </Button>
                  </div>
                  
                  {/* 高さ */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (typeof selectedLayer.height === 'number') {
                          updateLayer(selectedLayer.id, { height: Math.max(10, selectedLayer.height - 20) });
                        }
                      }}
                      className="h-7 w-7 p-0"
                    >
                      −
                    </Button>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">高さ</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={typeof selectedLayer.height === 'number' ? Math.round(selectedLayer.height) : 0}
                        onChange={(e) => updateLayer(selectedLayer.id, { height: Math.max(10, Number(e.target.value)) })}
                        className="h-7 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (typeof selectedLayer.height === 'number') {
                          updateLayer(selectedLayer.id, { height: selectedLayer.height + 20 });
                        }
                      }}
                      className="h-7 w-7 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* 回転調整 */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">🔄 回転</Label>
                <div className="flex gap-1 items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateLayer(selectedLayer.id, { rotation: (selectedLayer.rotation || 0) - 15 })}
                    className="h-7 w-7 p-0"
                    title="反時計回り 15°"
                  >
                    ↺
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateLayer(selectedLayer.id, { rotation: (selectedLayer.rotation || 0) - 5 })}
                    className="h-7 w-7 p-0"
                    title="反時計回り 5°"
                  >
                    ↶
                  </Button>
                  <div className="flex-1">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={Math.round(selectedLayer.rotation || 0)}
                      onChange={(e) => updateLayer(selectedLayer.id, { rotation: Number(e.target.value) })}
                      className="h-7 text-xs text-center"
                      placeholder="角度"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateLayer(selectedLayer.id, { rotation: (selectedLayer.rotation || 0) + 5 })}
                    className="h-7 w-7 p-0"
                    title="時計回り 5°"
                  >
                    ↷
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateLayer(selectedLayer.id, { rotation: (selectedLayer.rotation || 0) + 15 })}
                    className="h-7 w-7 p-0"
                    title="時計回り 15°"
                  >
                    ↻
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateLayer(selectedLayer.id, { rotation: 0 })}
                    className="h-7 px-2 text-xs"
                  >
                    0°
                  </Button>
                </div>
              </div>
              
              {/* テキスト専用設定 */}
              {selectedLayer.type === 'text' && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">✏️ テキスト設定</Label>
                  <div className="space-y-2">
                    <Textarea
                      value={selectedLayer.text || ''}
                      onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                      className="text-xs min-h-[60px] resize-none"
                      placeholder="テキストを入力"
                    />
                    <div className="space-y-2">
                      {/* 色選択 */}
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground w-8">色</Label>
                        <input
                          type="color"
                          value={selectedLayer.color || '#000000'}
                          onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                          className="w-8 h-7 rounded border"
                        />
                        <Input
                          value={selectedLayer.color || '#000000'}
                          onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                          className="h-7 text-xs flex-1"
                          placeholder="#000000"
                        />
                      </div>
                      
                      {/* フォントサイズ */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const currentSize = parseFloat(selectedLayer.fontSize || '1rem');
                            const newSize = Math.max(0.5, currentSize - 0.25);
                            updateLayer(selectedLayer.id, { fontSize: `${newSize}rem` });
                          }}
                          className="h-7 w-7 p-0"
                        >
                          −
                        </Button>
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">サイズ</Label>
                          <Input
                            value={selectedLayer.fontSize || '1rem'}
                            onChange={(e) => updateLayer(selectedLayer.id, { fontSize: e.target.value })}
                            className="h-7 text-xs"
                            placeholder="1rem"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const currentSize = parseFloat(selectedLayer.fontSize || '1rem');
                            const newSize = currentSize + 0.25;
                            updateLayer(selectedLayer.id, { fontSize: `${newSize}rem` });
                          }}
                          className="h-7 w-7 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-xs">レイヤーを選択してください</p>
            </div>
          )}
        </div>
      )}
      
      {selectedTab === "preview" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">プレビュー設定</h4>
          <div className="space-y-3">
            {/* ズーム調整 */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">🔍 ズーム</Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                  className="h-8 w-8 p-0"
                  disabled={zoom <= 0.25}
                >
                  −
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                  className="h-8 w-8 p-0"
                  disabled={zoom >= 4}
                >
                  +
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(1)}
                className="w-full h-8"
              >
                リセット (100%)
              </Button>
            </div>

            {/* プレビュー情報表示 */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">📊 プレビュー情報</Label>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">アスペクト比:</span>
                  <span className="font-medium">
                    {aspectRatio === 'custom' 
                      ? `${customAspectRatio.width}:${customAspectRatio.height}` 
                      : aspectRatio || '16:9'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ズーム率:</span>
                  <span className="font-medium">{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">グリッド:</span>
                  <span className="font-medium">40px</span>
                </div>
              </div>
            </div>

            {/* プレビュー設定 */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">⚙️ プレビュー設定</Label>
              <div className="space-y-2">
                {/* グリッド表示 */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">グリッド表示</Label>
                  <Button
                    size="sm"
                    variant={showGrid ? "default" : "outline"}
                    onClick={() => setShowGrid(!showGrid)}
                    className="h-6 px-2 text-xs"
                  >
                    {showGrid ? "ON" : "OFF"}
                  </Button>
                </div>
                
                {/* アスペクト比ガイド */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">アスペクト比ガイド</Label>
                  <Button
                    size="sm"
                    variant={showAspectGuide ? "default" : "outline"}
                    onClick={() => setShowAspectGuide(!showAspectGuide)}
                    className="h-6 px-2 text-xs"
                  >
                    {showAspectGuide ? "ON" : "OFF"}
                  </Button>
                </div>
                
                {/* セーフエリア */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">セーフエリア</Label>
                  <Button
                    size="sm"
                    variant={showSafeArea ? "default" : "outline"}
                    onClick={() => setShowSafeArea(!showSafeArea)}
                    className="h-6 px-2 text-xs"
                  >
                    {showSafeArea ? "ON" : "OFF"}
                  </Button>
                </div>
                
                {/* グリッドサイズ */}
                {showGrid && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">グリッドサイズ</Label>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={gridSize === 10 ? "default" : "outline"}
                        onClick={() => setGridSize(10)}
                        className="h-6 px-2 text-xs flex-1"
                      >
                        10px
                      </Button>
                      <Button
                        size="sm"
                        variant={gridSize === 20 ? "default" : "outline"}
                        onClick={() => setGridSize(20)}
                        className="h-6 px-2 text-xs flex-1"
                      >
                        20px
                      </Button>
                      <Button
                        size="sm"
                        variant={gridSize === 40 ? "default" : "outline"}
                        onClick={() => setGridSize(40)}
                        className="h-6 px-2 text-xs flex-1"
                      >
                        40px
                      </Button>
                    </div>
                  </div>
                )}
                {showGrid && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground w-20">色</Label>
                      <input
                        type="color"
                  value={(function(){try{const m=gridColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),/);if(m){const r=parseInt(m[1],10),g=parseInt(m[2],10),b=parseInt(m[3],10);const hx=(n: number)=>n.toString(16).padStart(2,'0');return `#${hx(r)}${hx(g)}${hx(b)}`}}catch(e){}return '#88daff';})()}
                        onChange={(e)=>{const hex=e.target.value;const r=parseInt(hex.slice(1,3),16);const g=parseInt(hex.slice(3,5),16);const b=parseInt(hex.slice(5,7),16);setGridColor(`rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, gridOpacity))})`);}}
                        className="w-8 h-7 rounded border"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">不透明度</Label>
                      <Slider
                        value={[Math.round(gridOpacity*100)]}
                        onValueChange={([v])=>setGridOpacity(v/100)}
                        min={10}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                      <div className="text-xs text-muted-foreground text-center mt-1">{Math.round(gridOpacity*100)}%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">主要線</Label>
                      <Button size="sm" variant={showMajorLines?"default":"outline"} onClick={()=>setShowMajorLines(!showMajorLines)} className="h-6 px-2 text-xs">{showMajorLines?"ON":"OFF"}</Button>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">主要線の間隔</Label>
                      <div className="flex gap-1 mt-1">
                        {[3,5,10].map(n=> (
                          <Button key={n} size="sm" variant={majorInterval===n?"default":"outline"} onClick={()=>setMajorInterval(n)} className="h-6 px-2 text-xs">{n}</Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">スナップ</Label>
                      <Button size="sm" variant={snapToGrid?"default":"outline"} onClick={()=>setSnapToGrid(!snapToGrid)} className="h-6 px-2 text-xs">{snapToGrid?"ON":"OFF"}</Button>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">スナップ強度</Label>
                      <div className="flex gap-1 mt-1">
                        {[0,4,8,16].map(n=> (
                          <Button key={n} size="sm" variant={snapStrength===n?"default":"outline"} onClick={()=>setSnapStrength(n)} className="h-6 px-2 text-xs">{n}px</Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>

            {/* プレビューモード切り替え */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">📺 表示モード</Label>
              <Button
                size="sm"
                variant={isPreviewDedicatedMode ? "default" : "outline"}
                onClick={() => setIsPreviewDedicatedMode(!isPreviewDedicatedMode)}
                className="w-full h-8"
              >
                {isPreviewDedicatedMode ? "通常表示に戻る" : "フルスクリーン表示"}
              </Button>
            </div>

            {/* 保存・エクスポート */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">💾 保存・出力</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  className="h-8"
                >
                  保存
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadThumbnail('high')}
                  className="h-8"
                >
                  ダウンロード
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* レイヤー追加ボタン */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">レイヤーを追加</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddText}
            className="flex items-center gap-2"
          >
            <span className="text-lg">T</span>
            <span>テキスト</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById('image-upload')?.click()}
            className="flex items-center gap-2"
          >
            <span className="text-lg">🖼️</span>
            <span>画像</span>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAddShape('rectangle')}
            className="flex items-center gap-2"
          >
            <span className="text-lg">⬜</span>
            <span>四角</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAddShape('circle')}
            className="flex items-center gap-2"
          >
            <span className="text-lg">⭕</span>
            <span>円</span>
          </Button>
        </div>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          multiple
        />
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col lg:h-screen">
      {/* モバイル用オーバーレイ（左サイドバーが開いている時のみ表示） */}
      {isLeftSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}
      
      {/* モバイル用オーバーレイ（右サイドバーが開いている時のみ表示） */}
      {isRightSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsRightSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row lg:h-full lg:overflow-hidden">
        {/* 左サイドバー (20%) - テンプレート・レイヤー管理 */}
        {!isPreviewDedicatedMode && (
          <LeftSidebar
            isDesktop={isDesktop}
            isSidebarOpen={isLeftSidebarOpen}
            setIsSidebarOpen={setIsLeftSidebarOpen}
            layers={layers}
            updateLayer={updateLayer}
            removeLayer={removeLayer}
            selectedLayerId={selectedLayerId}
            setSelectedLayerId={setSelectedLayerId}
            reorderLayers={reorderLayers}
            duplicateLayer={duplicateLayer}
            addLayer={addLayer}
            moveLayerUp={moveLayerUp}
            moveLayerDown={moveLayerDown}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            onShapeSelect={(shapeType) => handleAddShape(shapeType as ShapeType)}
          />
        )}

        {/* 中央プレビューエリア (60% or 100% in preview mode) */}
        <main className={isPreviewDedicatedMode ? "w-full flex flex-col min-w-0 overflow-hidden" : "w-3/5 flex flex-col min-w-0 overflow-hidden"}>
          <div className={`flex-1 flex flex-col min-h-0 ${isDesktop ? 'p-6' : 'p-2 pt-16'}`}>
            <div className="flex-1 flex flex-col min-h-0">
              <PreviewSection
                isDesktop={isDesktop}
                isPreviewDedicatedMode={isPreviewDedicatedMode}
                setIsPreviewDedicatedMode={setIsPreviewDedicatedMode}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                showAspectGuide={showAspectGuide}
                setShowAspectGuide={setShowAspectGuide}
                showSafeArea={showSafeArea}
                setShowSafeArea={setShowSafeArea}
                showCenterLines={showCenterLines}
                setShowCenterLines={setShowCenterLines}
                gridSize={gridSize}
                setGridSize={setGridSize}
                gridColor={gridColor}
                setGridColor={setGridColor}
                gridOpacity={gridOpacity}
                setGridOpacity={setGridOpacity}
                showMajorLines={showMajorLines}
                setShowMajorLines={setShowMajorLines}
                majorInterval={majorInterval}
                setMajorInterval={setMajorInterval}
                snapToGrid={snapToGrid}
                setSnapToGrid={setSnapToGrid}
                snapStrength={snapStrength}
                setSnapStrength={setSnapStrength}
                zoom={zoom}
                setZoom={setZoom}
                onFitToScreen={handleFitToScreen}
                baseSizeRef={baseSizeRef}
                layers={layers}
                selectedLayerId={selectedLayerId}
                setSelectedLayerId={setSelectedLayerId}
                updateLayer={updateLayer}
                removeLayer={removeLayer}
                duplicateLayer={duplicateLayer}
                moveLayerUp={moveLayerUp}
                moveLayerDown={moveLayerDown}
                reorderLayers={reorderLayers}
                addLayer={addLayer}
                aspectRatio={aspectRatio}
                customAspectRatio={customAspectRatio}
                isShiftKeyDown={isShiftKeyDown}
                handleLayerDragStop={handleLayerDragStop}
                handleLayerResize={handleLayerResize}
                handleToolbarUndo={handleToolbarUndo}
                handleToolbarRedo={handleToolbarRedo}
                handleSave={handleSave}
                handleDownloadThumbnail={handleDownloadThumbnail}
                handleQuickExport={handleQuickExport}
                onOpenExportSettings={() => {
                  setIsRightSidebarOpen(true);
                  setSelectedTab('export');
                }}
                canUndo={canUndo}
                canRedo={canRedo}
                handleAddShape={handleAddShape}
                renderToolsPanel={renderToolsPanel}
                history={history}
                historyIndex={historyIndex}
                onJumpToHistory={jumpToHistory}
              />
            </div>
          </div>
          
          {/* モバイル用コントロール - プレビュー専用モード時は非表示 */}
          {!isDesktop && !isPreviewDedicatedMode && (
            <div className="border-t bg-background/95 backdrop-blur-sm">
              <div className="p-2 flex justify-between items-center">
                {!isPreviewDedicatedMode && (
                  <>
                    <button
                      onClick={() => setIsLeftSidebarOpen(true)}
                      className="text-xs bg-[#2D2D2D] text-[#A0A0A0] px-3 py-2 rounded border border-[#4A4A4A]"
                    >
                      📁 テンプレート・レイヤー
                    </button>
                    <button
                      onClick={() => setIsRightSidebarOpen(true)}
                      className="text-xs bg-[#2D2D2D] text-[#A0A0A0] px-3 py-2 rounded border border-[#4A4A4A]"
                    >
                      🛠️ ツール・エクスポート
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </main>

        {/* 右ツールバー (20%) - ツール設定・エクスポート */}
        {!isPreviewDedicatedMode && (
          <RightToolbar
            isDesktop={isDesktop}
            isSidebarOpen={isRightSidebarOpen}
            setIsSidebarOpen={setIsRightSidebarOpen}
            isExporting={isExporting}
            renderToolsPanel={renderToolsPanel}
            handleBatchExport={handleBatchExport}
            handleAdvancedExport={handleAdvancedExport}
            handleAddShape={handleAddShape}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        )}
      </div>
    </div>
  );
}

// TemplateProviderでラップしたコンポーネント
export default function AssetCreatorPageWithProvider() {
  return (
    <EditorProvider>
      <TemplateProvider>
        <AssetCreatorPage />
      </TemplateProvider>
    </EditorProvider>
  );
}
