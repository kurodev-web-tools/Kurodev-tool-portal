import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Layers, Construction, Minimize2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from '@/hooks/use-sidebar';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResizableDelta, Position } from 'react-rnd';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

import { useTemplate, ShapeType } from '../contexts/TemplateContext';
import TemplateSelector from './TemplateSelector';
import ThumbnailText from '@/components/shared/thumbnail/ThumbnailText';
import ThumbnailImage from '@/components/shared/thumbnail/ThumbnailImage';
import ThumbnailShape from '@/components/shared/thumbnail/ThumbnailShape';
import { MobileControls } from '@/components/shared/MobileControls';
import { MobileDisplaySettings } from '@/components/shared/MobileDisplaySettings';
import { UnifiedLayerPanel } from '@/components/shared/UnifiedLayerPanel';
import { ExportSettingsPanel, ExportSettings } from './ExportSettingsPanel';
import { Toolbar } from '../../asset-creator/components/Toolbar';
import { LeftSidebar } from './LeftSidebar';
import { RightToolbar } from './RightToolbar';
import { useCanvasOperations } from '../../asset-creator/hooks/useCanvasOperations';
import { parseTextShadow, buildTextShadow } from '@/utils/textShadowUtils';
import { FontSelector } from '@/components/shared/FontSelector';
import { ShapeTypeSelector } from '@/components/shared/ShapeTypeSelector';
import { logger } from '@/lib/logger';
import { isTextLayer, isImageLayer, isShapeLayer } from '@/types/layers';
import { useUIState } from '../hooks/useUIState';
import { useExportHandlers } from '../hooks/useExportHandlers';
import { useEditorState } from '../hooks/useEditorState';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface EditorUIProps {
  // 必要なpropsを定義
}

/**
 * エディタのUIコンポーネント
 * page.tsxからJSX部分を分離して保守性を向上
 * 既存のUIと機能を完全に保持
 */
export const EditorUI: React.FC<EditorUIProps> = () => {
  // UI状態管理（最小限）
  const uiState = useUIState();
  
  // エクスポート機能管理
  const exportHandlers = useExportHandlers();
  
  // エディター状態管理
  const editorState = useEditorState();
  
  // キーボードショートカット管理
  const { isShiftKeyDown } = useKeyboardShortcuts();
  
  // 左サイドバー状態管理
  const { isOpen: isLeftSidebarOpen, setIsOpen: setIsLeftSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });

  // 右サイドバー状態管理
  const { isOpen: isRightSidebarOpen, setIsOpen: setIsRightSidebarOpen } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });

  const { handleAsyncError } = useErrorHandler();

  const selectedLayer = editorState.layers.find(layer => layer.id === editorState.selectedLayerId);

  // レイヤーの変更を監視して履歴を保存
  const prevLayersRef = useRef(editorState.layers);
  useEffect(() => {
    const currentLayers = editorState.layers;
    const prevLayers = prevLayersRef.current;
    
    console.log('=== LAYERS EFFECT TRIGGERED ===');
    console.log('Layers effect triggered:', {
      prev: prevLayers.length,
      current: currentLayers.length,
      selectedLayerId: editorState.selectedLayerId,
      canUndo: editorState.canUndo,
      canRedo: editorState.canRedo,
      prevLayers: prevLayers.map(l => ({ id: l.id, type: l.type })),
      currentLayers: currentLayers.map(l => ({ id: l.id, type: l.type }))
    });
    
    // レイヤーの数が変わった場合（追加・削除）は履歴を保存
    if (currentLayers.length !== prevLayers.length) {
      console.log('*** LAYERS COUNT CHANGED ***');
      console.log('Layers count changed, saving to history:', {
        prev: prevLayers.length,
        current: currentLayers.length,
        selectedLayerId: editorState.selectedLayerId
      });
      
      // 少し遅延させてから履歴を保存（レイヤー状態の更新を待つ）
      setTimeout(() => {
        console.log('*** EXECUTING DELAYED HISTORY SAVE ***');
        editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
      }, 100);
    } else {
      console.log('Layers count unchanged, skipping history save');
    }
    
    prevLayersRef.current = currentLayers;
    console.log('=== END LAYERS EFFECT ===');
  }, [editorState.layers, editorState.selectedLayerId, editorState.addToHistory, editorState.canUndo, editorState.canRedo]);

  // グラデーション・アウトライン・シャドウの有効/無効状態を同期
  const [gradientEnabled, setGradientEnabled] = React.useState(false);
  const [outlineEnabled, setOutlineEnabled] = React.useState(false);
  const [customColor1, setCustomColor1] = React.useState('#ff0000');
  const [customColor2, setCustomColor2] = React.useState('#0000ff');
  const [customAngle, setCustomAngle] = React.useState(90);
  const [showCustom, setShowCustom] = React.useState(false);

  React.useEffect(() => {
    if (selectedLayer && isTextLayer(selectedLayer)) {
      // シャドウ
      if (selectedLayer.textShadow && selectedLayer.textShadow !== 'none') {
        uiState.setShadowEnabled(true);
      } else {
        uiState.setShadowEnabled(false);
      }
      
      // アウトライン
      if (selectedLayer.textStrokeWidth && selectedLayer.textStrokeWidth !== '0px') {
        setOutlineEnabled(true);
      } else {
        setOutlineEnabled(false);
      }
      
      // グラデーション
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
      uiState.setShadowEnabled(false);
      setOutlineEnabled(false);
      setGradientEnabled(false);
    }
  }, [selectedLayer, uiState]);

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
  // baseSizeRefの変更を検知するための状態（再レンダリング用）
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

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
    if (editorState.aspectRatio === 'custom') {
      aspectRatioValue = editorState.customAspectRatio.width / editorState.customAspectRatio.height;
    } else {
      const [w, h] = (editorState.aspectRatio || '16:9').split(':').map(Number);
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

    logger.info('基準サイズ計算完了', {
      aspectRatio: editorState.aspectRatio,
      aspectRatioValue: aspectRatioValue.toFixed(2),
      optimalSize: { width: optimalWidth.toFixed(1), height: optimalHeight.toFixed(1) },
      calculatedBaseSize: optimalWidth.toFixed(1)
    }, 'calculateBaseSize');

    return optimalWidth;
  }, [editorState.aspectRatio, editorState.customAspectRatio, isDesktop, calculateSafetyMarginByAspectRatio]);

  // アスペクト比変更時に基準サイズを更新
  React.useEffect(() => {
    const newBaseSize = calculateBaseSize();
    baseSizeRef.current = newBaseSize;
    // 基準サイズが変わったので、ズームも100%に戻す
    editorState.setZoom(1.0);
  }, [editorState.aspectRatio, editorState.customAspectRatio, calculateBaseSize, editorState.setZoom]);

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
      const previousSize = baseSizeRef.current;
      
      // 計算結果がフォールバック値（400）より大きい場合、または初期値が400の場合は更新
      // 強制的に更新して再レンダリングをトリガー
      if (newBaseSize > 400 || previousSize === 400) {
        baseSizeRef.current = newBaseSize;
        // ズームを設定して再レンダリングをトリガー
        editorState.setZoom(1.0);
        // 強制的に再レンダリングをトリガー
        forceUpdate();
        logger.info('初期基準サイズを更新しました', { 
          baseSize: newBaseSize, 
          previousSize: previousSize,
          containerSize: { width: containerRect.width, height: containerRect.height },
          aspectRatio: editorState.aspectRatio
        }, 'updateBaseSizeWhenReady');
      }
    };

    // 初期レンダリング後に実行
    const timeoutId = setTimeout(updateBaseSizeWhenReady, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [calculateBaseSize, editorState.setZoom, isLeftSidebarOpen, isRightSidebarOpen, uiState.isPreviewDedicatedMode]);

  // ウィンドウリサイズ時の基準サイズ更新
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      // 【重要】リサイズ後は基準サイズを再計算し、ズームを100%に戻す
      const newBaseSize = calculateBaseSize();
      baseSizeRef.current = newBaseSize;
      // 基準サイズが変わったので、ズームも100%に戻す
      editorState.setZoom(1.0);
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
  }, [calculateBaseSize, editorState.setZoom]);

  // 画面フィットボタンのハンドラー
  const handleFitToScreen = React.useCallback(() => {
    // 常に100%に戻す（基準サイズ = 100%）
    editorState.setZoom(1.0);
  }, [editorState.setZoom]);

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
          editorState.setZoom((prevZoom: number) => {
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
            if (editorState.aspectRatio === 'custom') {
              aspectRatioValue = editorState.customAspectRatio.width / editorState.customAspectRatio.height;
            } else {
              const [w, h] = (editorState.aspectRatio || '16:9').split(':').map(Number);
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
          editorState.setZoom((prevZoom: number) => getNextZoomLevel(prevZoom, direction));
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
  }, [editorState.setZoom, editorState.aspectRatio, editorState.customAspectRatio]);

  // プレビューエリアのサイズ計算（プレビュー専用モード最大化対応）
  const getPreviewSize = React.useCallback(() => {
    if (!isDesktop) {
      // モバイル表示：画面幅を最大限活用
      if (uiState.isPreviewDedicatedMode) {
        // フルスクリーン表示時は画面幅の98%を使用（最大化）
        return { width: '98vw', maxWidth: 'none' };
      }
      // 通常表示時は画面幅の90%を使用（サイドバー分を考慮）
      return { width: '90vw', maxWidth: 'none' };
    }

    // プレビュー専用モード（最大化機能強化）
    if (uiState.isPreviewDedicatedMode) {
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
  }, [isDesktop, uiState.isPreviewDedicatedMode, isLeftSidebarOpen, isRightSidebarOpen]);

  // デスクトップ表示時は初期状態でサイドバーを開く
  React.useEffect(() => {
    if (isDesktop) {
      setIsLeftSidebarOpen(true);
      setIsRightSidebarOpen(true);
    } else {
      setIsLeftSidebarOpen(false);
      setIsRightSidebarOpen(false);
    }
  }, [isDesktop]);

  // 画像の読み込み完了を待つ
  const waitForImagesToLoad = async (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve();
        } else {
          const onLoad = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            resolve();
          };
          const onError = () => {
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onError);
          logger.warn('画像の読み込みに失敗しました', { src: img.src }, 'ThumbnailGenerator');
          resolve(); // エラーでも続行
        };
          img.addEventListener('load', onLoad);
          img.addEventListener('error', onError);
        }
      });
    });
    
    await Promise.all(imagePromises);
    
    // より長い待機時間でレンダリングを確実にする
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  // レイヤーのドラッグ＆リサイズハンドラー
  const handleLayerDragStop = React.useCallback((id: string, _: unknown, d: Position) => {
    // 履歴を先に保存（更新前の状態）
    editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
    // グリッドスナップ処理
    let x = d.x;
    let y = d.y;
    if (uiState.snapToGrid) {
      const step = uiState.gridSize;
      const sx = Math.round(x / step) * step;
      const sy = Math.round(y / step) * step;
      if (Math.abs(sx - x) <= uiState.snapStrength) x = sx;
      if (Math.abs(sy - y) <= uiState.snapStrength) y = sy;
    }
    // その後でレイヤーを更新
    editorState.updateLayer(id, { x, y });
  }, [editorState.updateLayer, editorState.addToHistory, editorState.layers, editorState.selectedLayerId, uiState.snapToGrid, uiState.gridSize, uiState.snapStrength]);

  const handleLayerResize = React.useCallback((id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    // 履歴を先に保存（更新前の状態）
    editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
    // グリッドスナップ処理
    let x = position.x;
    let y = position.y;
    if (uiState.snapToGrid) {
      const step = uiState.gridSize;
      const sx = Math.round(x / step) * step;
      const sy = Math.round(y / step) * step;
      if (Math.abs(sx - x) <= uiState.snapStrength) x = sx;
      if (Math.abs(sy - y) <= uiState.snapStrength) y = sy;
    }
    // その後でレイヤーを更新
    editorState.updateLayer(id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x,
      y,
    });
  }, [editorState.updateLayer, editorState.addToHistory, editorState.layers, editorState.selectedLayerId, uiState.snapToGrid, uiState.gridSize, uiState.snapStrength]);

  const handleLayerResizeStop = React.useCallback((id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    // リサイズ完了時に履歴を保存
    editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
    // グリッドスナップ処理
    let x = position.x;
    let y = position.y;
    if (uiState.snapToGrid) {
      const step = uiState.gridSize;
      const sx = Math.round(x / step) * step;
      const sy = Math.round(y / step) * step;
      if (Math.abs(sx - x) <= uiState.snapStrength) x = sx;
      if (Math.abs(sy - y) <= uiState.snapStrength) y = sy;
    }
    editorState.updateLayer(id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x,
      y,
    });
  }, [editorState.updateLayer, editorState.addToHistory, editorState.layers, editorState.selectedLayerId, uiState.snapToGrid, uiState.gridSize, uiState.snapStrength]);

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
      editorState.addLayer({
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
      // レイヤー追加後に履歴を保存
      editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
    }
    e.target.value = '';
  };

  const handleAddShape = (shapeType: ShapeType) => {
    const offset = editorState.layers.filter(l => l.type === 'shape').length * (isDesktop ? 20 : 5);
    const shapeCount = editorState.layers.filter(l => l.type === 'shape' && 'shapeType' in l && l.shapeType === shapeType).length + 1;
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

    editorState.addLayer({
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
    // レイヤー追加後に履歴を保存
    editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
  };

  const handleAddText = () => {
    console.log('Adding text layer...');
    editorState.addLayer({
      type: 'text',
      name: `テキスト ${editorState.layers.filter(l => l.type === 'text').length + 1}`,
      visible: true,
      locked: false,
      x: isDesktop ? 550 : 50,
      y: isDesktop ? 250 : 50,
      width: isDesktop ? 300 : 150,
      height: isDesktop ? 100 : 50,
      text: editorState.currentText,
      color: '#000000',
      fontSize: isDesktop ? '2rem' : '1rem',
      // フォント設定はeditorState.addLayer関数内でcurrentFontSettingsから自動適用される
    } as any);
    console.log('Text layer added, layers count:', editorState.layers.length);
  };

  if (!editorState.selectedTemplate) {
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

  // ハンドラー関数を追加
  const handleSave = React.useCallback(() => {
    // ローカルストレージに保存（簡易版）
    try {
      localStorage.setItem('thumbnail-project', JSON.stringify({
        layers: editorState.layers,
        selectedLayerId: editorState.selectedLayerId,
        timestamp: Date.now()
      }));
      toast.success('プロジェクトを保存しました');
    } catch (error) {
      toast.error('保存に失敗しました');
    }
  }, [editorState.layers, editorState.selectedLayerId]);

  const handleUndo = React.useCallback(() => {
    console.log('Toolbar undo button clicked');
    const result = editorState.handleUndo();
    if (result) {
      toast.success('元に戻しました');
    } else {
      console.log('Undo failed - no history to undo');
    }
  }, [editorState.handleUndo]);

  const handleRedo = React.useCallback(() => {
    console.log('Toolbar redo button clicked');
    const result = editorState.handleRedo();
    if (result) {
      toast.success('やり直しました');
    } else {
      console.log('Redo failed - no history to redo');
    }
  }, [editorState.handleRedo]);

  // クイックエクスポート処理（プラットフォーム別）
  const handleQuickExport = React.useCallback(async (platform: 'twitter-post' | 'twitter-header' | 'youtube-thumbnail' | 'youtube-thumbnail-hd' | 'instagram-post' | 'instagram-story') => {
    const element = document.getElementById('thumbnail-preview');
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
      const settings: ExportSettings = {
        resolution: 'custom',
        customWidth: config.width,
        customHeight: config.height,
        quality: 'high',
        format: config.format,
        pixelRatio: config.pixelRatio,
        backgroundColor: '#ffffff',
        includeTransparency: false,
        optimizeForPlatform: platform.startsWith('twitter') ? 'twitter' : platform.startsWith('youtube') ? 'youtube' : 'instagram',
        batchExport: false,
        batchSizes: []
      };
      
      await exportHandlers.handleAdvancedExport(settings);
      toast.success(`${platform === 'twitter-post' ? 'Twitter投稿' : 
                     platform === 'twitter-header' ? 'Twitterヘッダー' :
                     platform === 'youtube-thumbnail' ? 'YouTubeサムネイル' :
                     platform === 'youtube-thumbnail-hd' ? 'YouTubeサムネイルHD' :
                     platform === 'instagram-post' ? 'Instagram投稿' : 'Instagramストーリー'}形式でエクスポートしました`);
    } catch (error) {
      logger.error('Quick export failed', error, 'ThumbnailGenerator');
      toast.error('エクスポートに失敗しました');
    }
  }, [exportHandlers]);

  // 詳細設定を開く
  const handleOpenExportSettings = React.useCallback(() => {
    // 右サイドバーのエクスポートタブを開く
    uiState.setSelectedTab('export');
    setIsRightSidebarOpen(true);
    // エクスポートタブにスクロール
    setTimeout(() => {
      const exportTab = document.querySelector('[value="export"]');
      if (exportTab) {
        (exportTab as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [uiState, setIsRightSidebarOpen]);

  // レンダリング関数を実装
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
              onChange={(e) => selectedLayer && editorState.updateLayer(selectedLayer.id, { name: e.target.value })}
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
                onChange={(e) => selectedLayer && editorState.updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Y座標</Label>
              <Input
                type="number"
                value={selectedLayer?.y || 0}
                onChange={(e) => selectedLayer && editorState.updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
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
                onChange={(e) => selectedLayer && editorState.updateLayer(selectedLayer.id, { width: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">高さ</Label>
              <Input
                type="number"
                value={selectedLayer?.height || 0}
                onChange={(e) => selectedLayer && editorState.updateLayer(selectedLayer.id, { height: Number(e.target.value) })}
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
                onChange={(e) => editorState.updateLayer(selectedLayer.id, { text: e.target.value })}
                className="mt-1 min-h-[80px] resize-none"
                placeholder="テキストを入力してください"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">フォントサイズ</Label>
              <Slider
                value={[parseFloat(selectedLayer.fontSize?.replace('rem', '') || '2')]}
                onValueChange={([value]) => editorState.updateLayer(selectedLayer.id, { fontSize: `${value}rem` })}
                min={0.5}
                max={8}
                step={0.1}
                className="mt-2"
              />
              <div className="text-xs text-[#A0A0A0] text-center mt-1">
                {selectedLayer.fontSize || '2rem'}
              </div>
            </div>

            {/* フォント設定 */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-[#E0E0E0]">フォント設定</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-[#A0A0A0]">フォントファミリー</Label>
                  <FontSelector
                    value={selectedLayer.fontFamily || 'Arial, sans-serif'}
                    onValueChange={(value) => editorState.updateLayer(selectedLayer.id, { fontFamily: value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#A0A0A0]">フォントウェイト</Label>
                  <Select
                    value={selectedLayer.fontWeight || 'normal'}
                    onValueChange={(value) => editorState.updateLayer(selectedLayer.id, { fontWeight: value })}
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
                    onValueChange={(value) => editorState.updateLayer(selectedLayer.id, { fontStyle: value })}
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
                    onValueChange={(value) => editorState.updateLayer(selectedLayer.id, { textDecoration: value })}
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
            
            {/* 文字間隔 */}
            <div>
              <Label className="text-xs text-[#A0A0A0]">文字間隔</Label>
              <Slider
                value={[parseFloat(selectedLayer.letterSpacing?.replace('px', '') || '0')]}
                onValueChange={([value]) => editorState.updateLayer(selectedLayer.id, { letterSpacing: `${value}px` })}
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
                        editorState.updateLayer(selectedLayer.id, { textGradient: undefined });
                      } else {
                        editorState.updateLayer(selectedLayer.id, { textGradient: 'linear-gradient(90deg, #ff0000, #0000ff)' });
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
                    editorState.updateLayer(selectedLayer.id, { 
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
                                editorState.updateLayer(selectedLayer.id, { textGradient: preset.gradient });
                                setShowCustom(false);
                              }}
                              className="h-8 rounded border border-[#4A4A4A] hover:border-[#808080] transition-colors text-[10px] relative overflow-hidden group"
                              style={{
                                background: preset.gradient,
                              }}
                              title={preset.name}
                            >
                              <span className="relative z-10 text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
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
                                  onChange={(e) => {
                                    setCustomColor1(e.target.value);
                                    editorState.updateLayer(selectedLayer.id, { 
                                      textGradient: `linear-gradient(${customAngle}deg, ${e.target.value}, ${customColor2})` 
                                    });
                                  }}
                                  className="w-8 h-7 rounded border border-[#4A4A4A]"
                                />
                                <Input
                                  value={customColor1}
                                  onChange={(e) => {
                                    setCustomColor1(e.target.value);
                                    editorState.updateLayer(selectedLayer.id, { 
                                      textGradient: `linear-gradient(${customAngle}deg, ${e.target.value}, ${customColor2})` 
                                    });
                                  }}
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
                                  onChange={(e) => {
                                    setCustomColor2(e.target.value);
                                    editorState.updateLayer(selectedLayer.id, { 
                                      textGradient: `linear-gradient(${customAngle}deg, ${customColor1}, ${e.target.value})` 
                                    });
                                  }}
                                  className="w-8 h-7 rounded border border-[#4A4A4A]"
                                />
                                <Input
                                  value={customColor2}
                                  onChange={(e) => {
                                    setCustomColor2(e.target.value);
                                    editorState.updateLayer(selectedLayer.id, { 
                                      textGradient: `linear-gradient(${customAngle}deg, ${customColor1}, ${e.target.value})` 
                                    });
                                  }}
                                  className="flex-1 h-7 text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-[#A0A0A0]">方向</Label>
                              <Select
                                value={customAngle.toString()}
                                onValueChange={(value) => {
                                  const newAngle = parseInt(value);
                                  setCustomAngle(newAngle);
                                  editorState.updateLayer(selectedLayer.id, { 
                                    textGradient: `linear-gradient(${newAngle}deg, ${customColor1}, ${customColor2})` 
                                  });
                                }}
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
                            onChange={(e) => editorState.updateLayer(selectedLayer.id, { textGradient: e.target.value })}
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
                      onChange={(e) => editorState.updateLayer(selectedLayer.id, { color: e.target.value })}
                      className="w-8 h-8 rounded border border-[#4A4A4A]"
                    />
                    <Input
                      value={selectedLayer.color || '#ffffff'}
                      onChange={(e) => editorState.updateLayer(selectedLayer.id, { color: e.target.value })}
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
                        editorState.updateLayer(selectedLayer.id, { textStrokeWidth: '0px' });
                      } else {
                        editorState.updateLayer(selectedLayer.id, { textStrokeWidth: '2px', textStrokeColor: '#000000' });
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
                        onValueChange={([value]) => editorState.updateLayer(selectedLayer.id, { textStrokeWidth: `${value}px` })}
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
                          onChange={(e) => editorState.updateLayer(selectedLayer.id, { textStrokeColor: e.target.value })}
                          className="w-8 h-7 rounded border border-[#4A4A4A]"
                        />
                        <Input
                          value={selectedLayer.textStrokeColor || '#000000'}
                          onChange={(e) => editorState.updateLayer(selectedLayer.id, { textStrokeColor: e.target.value })}
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
                    variant={uiState.shadowEnabled ? "default" : "outline"}
                    onClick={() => {
                      const newEnabled = !uiState.shadowEnabled;
                      uiState.setShadowEnabled(newEnabled);
                      if (!newEnabled) {
                        editorState.updateLayer(selectedLayer.id, { textShadow: 'none' });
                      } else {
                        editorState.updateLayer(selectedLayer.id, { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' });
                      }
                    }}
                    className="h-6 px-3 text-xs"
                  >
                    {uiState.shadowEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                
                {uiState.shadowEnabled && (() => {
                  const shadow = parseTextShadow(selectedLayer.textShadow);
                  const handleShadowChange = (param: 'x' | 'y' | 'blur' | 'color' | 'opacity', value: number | string) => {
                    const current = parseTextShadow(selectedLayer.textShadow);
                    const updated = { ...current, [param]: value };
                    const newShadow = buildTextShadow(updated.x, updated.y, updated.blur, updated.color, updated.opacity);
                    editorState.updateLayer(selectedLayer.id, { textShadow: newShadow });
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
                    editorState.updateLayer(selectedLayer.id, { src });
                  }
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">不透明度</Label>
              <Slider
                value={[selectedLayer.opacity || 100]}
                onValueChange={([value]) => editorState.updateLayer(selectedLayer.id, { opacity: value })}
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
                onValueChange={([value]) => editorState.updateLayer(selectedLayer.id, { rotation: value })}
                min={-180}
                max={180}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-[#A0A0A0] text-center mt-1">
                {selectedLayer.rotation || 0}°
              </div>
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
                  onChange={(shape) => editorState.updateLayer(selectedLayer.id, { shapeType: shape })}
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
                    onChange={(e) => editorState.updateLayer(selectedLayer.id, { backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-[#4A4A4A]"
                  />
                  <Input
                    value={selectedLayer.backgroundColor || '#000000'}
                    onChange={(e) => editorState.updateLayer(selectedLayer.id, { backgroundColor: e.target.value })}
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
                    onChange={(e) => editorState.updateLayer(selectedLayer.id, { borderColor: e.target.value })}
                    className="w-8 h-8 rounded border border-[#4A4A4A]"
                  />
                  <Input
                    value={selectedLayer.borderColor || '#000000'}
                    onChange={(e) => editorState.updateLayer(selectedLayer.id, { borderColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">境界線の太さ</Label>
              <Slider
                value={[selectedLayer.borderWidth || 0]}
                onValueChange={([value]) => editorState.updateLayer(selectedLayer.id, { borderWidth: value })}
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

      {/* レイヤーが選択されていない場合 */}
      {!selectedLayer && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">レイヤーを選択してください</p>
          <p className="text-xs text-muted-foreground mt-1">レイヤーパネルからレイヤーを選択すると、ここで詳細設定ができます</p>
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
              variant={uiState.showGrid ? "default" : "outline"}
              onClick={() => uiState.setShowGrid(!uiState.showGrid)}
              className="h-7 px-3 text-xs"
            >
              {uiState.showGrid ? 'ON' : 'OFF'}
            </Button>
          </div>
          {uiState.showGrid && (
            <div className="space-y-3 pl-2 border-l">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">グリッドサイズ</Label>
                <div className="flex gap-1">
                  {[10,20,40].map(n => (
                    <Button 
                      key={n} 
                      size="sm" 
                      variant={uiState.gridSize===n?"default":"outline"} 
                      onClick={() => uiState.setGridSize(n)} 
                      className="h-7 px-2 text-xs"
                    >
                      {n}px
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-20">色</Label>
                <input
                  type="color"
                  value={(function(){
                    try{
                      const m = uiState.gridColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),/);
                      if(m){
                        const r = parseInt(m[1],10), g = parseInt(m[2],10), b = parseInt(m[3],10);
                        const hx = (x:number) => x.toString(16).padStart(2,'0');
                        return `#${hx(r)}${hx(g)}${hx(b)}`;
                      }
                    }catch(e){}
                    return '#88daff';
                  })()}
                  onChange={(e) => {
                    const hex = e.target.value;
                    const r = parseInt(hex.slice(1,3),16);
                    const g = parseInt(hex.slice(3,5),16);
                    const b = parseInt(hex.slice(5,7),16);
                    uiState.setGridColor(`rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, uiState.gridOpacity))})`);
                  }}
                  className="w-8 h-7 rounded border"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">不透明度</Label>
                <Slider
                  value={[Math.round(uiState.gridOpacity*100)]}
                  onValueChange={([v]) => uiState.setGridOpacity(v/100)}
                  min={10}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <div className="text-xs text-muted-foreground text-center mt-1">
                  {Math.round(uiState.gridOpacity*100)}%
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">主要線</Label>
                <Button 
                  size="sm" 
                  variant={uiState.showMajorLines?"default":"outline"} 
                  onClick={() => uiState.setShowMajorLines(!uiState.showMajorLines)} 
                  className="h-7 px-3 text-xs"
                >
                  {uiState.showMajorLines ? "ON" : "OFF"}
                </Button>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">主要線の間隔</Label>
                <div className="flex gap-1 mt-1">
                  {[3,5,10].map(n => (
                    <Button 
                      key={n} 
                      size="sm" 
                      variant={uiState.majorInterval===n?"default":"outline"} 
                      onClick={() => uiState.setMajorInterval(n)} 
                      className="h-7 px-2 text-xs"
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">スナップ</Label>
                <Button 
                  size="sm" 
                  variant={uiState.snapToGrid?"default":"outline"} 
                  onClick={() => uiState.setSnapToGrid(!uiState.snapToGrid)} 
                  className="h-7 px-3 text-xs"
                >
                  {uiState.snapToGrid ? "ON" : "OFF"}
                </Button>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">スナップ強度</Label>
                <div className="flex gap-1 mt-1">
                  {[0,4,8,16].map(n => (
                    <Button 
                      key={n} 
                      size="sm" 
                      variant={uiState.snapStrength===n?"default":"outline"} 
                      onClick={() => uiState.setSnapStrength(n)} 
                      className="h-7 px-2 text-xs"
                    >
                      {n}px
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );


  // プレビューのレンダリング（簡易版）
  const renderPreview = () => (
    <>
      {/* ツールバー - デスクトップのみ表示 */}
      {isDesktop && (
        <Toolbar
          zoom={editorState.zoom}
          setZoom={editorState.setZoom}
          onFitToScreen={handleFitToScreen}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onDownload={exportHandlers.handleDownloadThumbnail}
          onQuickExport={handleQuickExport}
          onOpenExportSettings={handleOpenExportSettings}
          canUndo={editorState.canUndo}
          canRedo={editorState.canRedo}
          isPreviewDedicatedMode={uiState.isPreviewDedicatedMode}
          onTogglePreviewMode={() => uiState.setIsPreviewDedicatedMode(!uiState.isPreviewDedicatedMode)}
          showGrid={uiState.showGrid}
          setShowGrid={uiState.setShowGrid}
          showAspectGuide={uiState.showAspectGuide}
          setShowAspectGuide={uiState.setShowAspectGuide}
          showSafeArea={uiState.showSafeArea}
          setShowSafeArea={uiState.setShowSafeArea}
          showCenterLines={uiState.showCenterLines}
          setShowCenterLines={uiState.setShowCenterLines}
          history={editorState.history}
          historyIndex={editorState.historyIndex}
          onJumpToHistory={editorState.jumpToHistory}
        />
      )}
      
      {/* モバイル表示でのフルスクリーン表示時の戻るボタン */}
      {!isDesktop && uiState.isPreviewDedicatedMode && (
        <div className="absolute top-2 left-2 z-20">
          <Button
            size="sm"
            variant="outline"
            onClick={() => uiState.setIsPreviewDedicatedMode(false)}
            className="bg-background/90 backdrop-blur-sm shadow-lg"
          >
            <Minimize2 className="h-4 w-4 mr-1" />
            通常表示に戻る
          </Button>
        </div>
      )}
      
      {/* プレビューエリア */}
      <div 
        className="flex-1 min-h-0 overflow-auto bg-[#1A1A1A] relative custom-scrollbar" 
        data-preview-container="true"
      >
        <div className="flex items-start justify-center p-4 lg:p-8">
          <div className="w-full">
            {/* メインコンテンツエリア */}
            <div
              id="thumbnail-preview"
              style={{ 
                width: `${baseSizeRef.current * editorState.zoom}px`,
                aspectRatio: editorState.aspectRatio === 'custom' 
                  ? `${editorState.customAspectRatio.width}/${editorState.customAspectRatio.height}` 
                  : (editorState.aspectRatio || '16:9').replace(':', '/'),
                margin: '0 auto',
                transition: 'width 0.2s ease-in-out'
              }}
              className="bg-card relative border rounded-md shadow-lg"
            >
              <div id="download-target" className="w-full h-full relative overflow-hidden">
                {editorState.layers.map((layer) => {
                  const isSelected = layer.id === editorState.selectedLayerId;
                  const isDraggable = isSelected && !layer.locked;
                  const isResizable = isSelected && !layer.locked;

                  if (!layer.visible) return null;

                  if (layer.type === 'image') {
                    return (
                      <ThumbnailImage
                        key={layer.id} id={layer.id} isSelected={isSelected} src={layer.src || ''} alt={layer.name}
                        x={layer.x} y={layer.y} width={layer.width} height={layer.height} rotation={layer.rotation}
                        zIndex={layer.zIndex}
                        onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                        onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        lockAspectRatio={isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
                        onSelect={() => editorState.setSelectedLayerId(layer.id)}
                        isDraggable={isDraggable}
                        isLocked={layer.locked}
                        onRotateStart={() => {}}
                        onRotate={() => {}}
                        onRotateStop={() => {}}
                        updateLayer={editorState.updateLayer}
                      />
                    );
                  } else if (layer.type === 'text') {
                    return (
                      <ThumbnailText
                        key={layer.id} id={layer.id} isSelected={isSelected} text={layer.text || ''} color={layer.color}
                        fontSize={layer.fontSize} fontFamily={layer.fontFamily} fontWeight={layer.fontWeight}
                        fontStyle={layer.fontStyle} textDecoration={layer.textDecoration} textShadow={layer.textShadow}
                        letterSpacing={layer.letterSpacing}
                        textStrokeWidth={layer.textStrokeWidth}
                        textStrokeColor={layer.textStrokeColor}
                        textGradient={layer.textGradient}
                        x={layer.x} y={layer.y} width={layer.width} height={layer.height}
                        rotation={layer.rotation} zIndex={layer.zIndex}
                        onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                        onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        enableResizing={isResizable} disableDragging={!isDraggable}
                        updateLayer={editorState.updateLayer}
                      />
                    );
                  } else if (layer.type === 'shape') {
                    return (
                      <ThumbnailShape
                        key={layer.id} id={layer.id} isSelected={isSelected} shapeType={layer.shapeType as ShapeType}
                        backgroundColor={layer.backgroundColor || '#cccccc'} borderColor={layer.borderColor || '#000000'}
                        borderWidth={layer.borderWidth || 2} x={layer.x} y={layer.y} width={layer.width} height={layer.height}
                        rotation={layer.rotation} zIndex={layer.zIndex}
                        onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                        onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        lockAspectRatio={isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
                        updateLayer={editorState.updateLayer}
                      />
                    );
                  }
                  return null;
                })}

                {/* オーバーレイコンテナ（プレビュー要素内に配置） */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* グリッドオーバーレイ */}
                  {uiState.showGrid && (
                    <div 
                      className="absolute inset-0"
                      style={{
                        opacity: uiState.gridOpacity,
                        backgroundImage: (() => {
                          const unit = uiState.gridSize * editorState.zoom;
                          const minor = `linear-gradient(${uiState.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${uiState.gridColor} 1px, transparent 1px)`;
                          if (!uiState.showMajorLines) return minor;
                          // 主要線は少し濃い色に（アルファを強める）
                          let majorColor = uiState.gridColor;
                          try {
                            const m = uiState.gridColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/);
                            if (m) {
                              const r = m[1], g = m[2], b = m[3];
                              majorColor = `rgba(${r}, ${g}, ${b}, ${Math.min(1, Number(m[4]) + 0.2)})`;
                            }
                          } catch {}
                          const major = `linear-gradient(${majorColor} 1px, transparent 1px), linear-gradient(90deg, ${majorColor} 1px, transparent 1px)`;
                          return `${minor}, ${major}`;
                        })(),
                        backgroundSize: (() => {
                          const unit = uiState.gridSize * editorState.zoom;
                          if (!uiState.showMajorLines) return `${unit}px ${unit}px`;
                          const majorSize = unit * Math.max(1, uiState.majorInterval);
                          return `${unit}px ${unit}px, ${majorSize}px ${majorSize}px`;
                        })(),
                        backgroundPosition: '0 0, 0 0',
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* アスペクト比ガイド */}
                  {uiState.showAspectGuide && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="border-2 border-dashed border-cyan-400/80 bg-cyan-400/10 rounded shadow-lg"
                        style={{
                          width: '90%',
                          height: '90%',
                          aspectRatio: editorState.aspectRatio === 'custom' 
                            ? `${editorState.customAspectRatio.width}/${editorState.customAspectRatio.height}`
                            : (editorState.aspectRatio || '16:9'),
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  {/* セーフエリアガイド */}
                  {uiState.showSafeArea && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="border-2 border-dashed border-emerald-400/85 bg-emerald-400/10 rounded shadow-lg"
                        style={{
                          width: '95%',
                          height: '95%',
                          aspectRatio: editorState.aspectRatio === 'custom' 
                            ? `${editorState.customAspectRatio.width}/${editorState.customAspectRatio.height}`
                            : (editorState.aspectRatio || '16:9'),
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  {/* 中央線ガイド */}
                  {uiState.showCenterLines && (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-rose-400/85 shadow-sm" aria-hidden="true" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-0.5 bg-rose-400/85 shadow-sm" aria-hidden="true" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // モバイル用クイックアクセス
  const renderMobileControls = () => (
    <div className="p-2 lg:p-4 space-y-3">
      {/* モバイル用クイックアクション */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">クイックアクセス</h4>
        <Tabs value={uiState.selectedTab} onValueChange={uiState.setSelectedTab} className="w-full max-h-[40vh] flex flex-col">
          <TabsList className="w-full h-16 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground">
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
              編集
            </TabsTrigger>
            <TabsTrigger 
              value="display"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              表示設定
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="mt-4 flex-1 overflow-y-auto">
            {renderToolsPanel()}
          </TabsContent>
          
          <TabsContent value="layers" className="mt-4 flex-1 overflow-y-auto">
            <UnifiedLayerPanel 
              context={{
                layers: editorState.layers,
                updateLayer: editorState.updateLayer,
                removeLayer: editorState.removeLayer,
                selectedLayerId: editorState.selectedLayerId,
                setSelectedLayerId: editorState.setSelectedLayerId,
                reorderLayers: editorState.reorderLayers,
                duplicateLayer: editorState.duplicateLayer,
                addLayer: editorState.addLayer,
                moveLayerUp: editorState.moveLayerUp,
                moveLayerDown: editorState.moveLayerDown,
              }}
              onShapeSelect={(shapeType) => editorState.handleAddShape(shapeType as ShapeType)}
              showShapeSelector={true}
            />
          </TabsContent>
          
          <TabsContent value="edit" className="mt-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {/* レイヤー操作ボタン */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">レイヤー操作</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => editorState.duplicateLayer(editorState.selectedLayerId!)}>
                    複製
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => editorState.removeLayer(editorState.selectedLayerId!)}>
                    削除
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => editorState.moveLayerUp(editorState.selectedLayerId!)}>
                    最前面
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => editorState.moveLayerDown(editorState.selectedLayerId!)}>
                    最背面
                  </Button>
                </div>
              </div>

              {/* モバイル操作コントロール */}
              <MobileControls
                selectedLayer={editorState.layers.find(layer => layer.id === editorState.selectedLayerId) || null}
                onUpdateLayer={(id, updates) => editorState.updateLayer(id, updates)}
                className="mt-4"
              />
            </div>
          </TabsContent>

          <TabsContent value="display" className="mt-4 flex-1 overflow-y-auto">
            <MobileDisplaySettings
              zoom={editorState.zoom}
              onZoomChange={editorState.setZoom}
              showGrid={uiState.showGrid}
              onShowGridChange={uiState.setShowGrid}
              showGuides={uiState.showCenterLines}
              onShowGuidesChange={uiState.setShowCenterLines}
              showSafeArea={uiState.showSafeArea}
              onShowSafeAreaChange={uiState.setShowSafeArea}
              showAspectGuide={uiState.showAspectGuide}
              onShowAspectGuideChange={uiState.setShowAspectGuide}
              gridSize={uiState.gridSize}
              onGridSizeChange={uiState.setGridSize}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:h-screen lg:overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:h-full lg:overflow-hidden">
        {/* 左サイドバー (20%) - テンプレート・レイヤー管理 */}
        {!uiState.isPreviewDedicatedMode && (
          <LeftSidebar
            isDesktop={isDesktop}
            isSidebarOpen={isLeftSidebarOpen}
            setIsSidebarOpen={setIsLeftSidebarOpen}
            layers={editorState.layers as any[]}
            updateLayer={editorState.updateLayer as any}
            removeLayer={editorState.removeLayer}
            selectedLayerId={editorState.selectedLayerId}
            setSelectedLayerId={editorState.setSelectedLayerId}
            reorderLayers={editorState.reorderLayers}
            duplicateLayer={editorState.duplicateLayer}
            addLayer={editorState.addLayer as any}
            moveLayerUp={editorState.moveLayerUp}
            moveLayerDown={editorState.moveLayerDown}
            selectedTemplate={editorState.selectedTemplate}
            setSelectedTemplate={editorState.setSelectedTemplate}
            onShapeSelect={(shapeType) => handleAddShape(shapeType as ShapeType)}
          />
        )}

        {/* 中央プレビューエリア (60% or 100% in preview mode) */}
        <main className={uiState.isPreviewDedicatedMode ? "w-full flex flex-col min-w-0 overflow-hidden" : "w-3/5 flex flex-col min-w-0 overflow-hidden"}>
          <div className={`flex-1 flex flex-col min-h-0 ${isDesktop ? 'p-6' : 'p-2 pt-16'}`}>
            <div className="flex-1 flex flex-col min-h-0">
              {renderPreview()}
            </div>
          </div>
          {/* モバイル用コントロール - プレビュー専用モード時は非表示 */}
          {!isDesktop && !uiState.isPreviewDedicatedMode && (
            <div className="border-t bg-background/95 backdrop-blur-sm max-h-[40vh] overflow-y-auto flex-shrink-0">
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2">
                  💡 ヒント: 左サイドバーでテンプレート・レイヤー管理、右サイドバーで編集・エクスポート設定ができます。
                </p>
              </div>
              {renderMobileControls()}
            </div>
          )}
        </main>

        {/* 右ツールバー (20%) - ツール設定・エクスポート */}
        {!uiState.isPreviewDedicatedMode && (
          <RightToolbar
            isDesktop={isDesktop}
            isSidebarOpen={isRightSidebarOpen}
            setIsSidebarOpen={setIsRightSidebarOpen}
            isExporting={exportHandlers.isExporting}
            renderToolsPanel={renderToolsPanel}
            handleAdvancedExport={exportHandlers.handleAdvancedExport}
            handleAddShape={handleAddShape}
            selectedTab={uiState.selectedTab}
            setSelectedTab={uiState.setSelectedTab}
          />
        )}
      </div>
    </div>
  );
};
