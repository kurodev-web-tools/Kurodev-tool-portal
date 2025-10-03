'use client';

import React from 'react';
import { toPng } from 'html-to-image';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Settings, Layers, Construction, Minimize2 } from "lucide-react";
import { useSidebar } from '@/hooks/use-sidebar';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from '@/hooks/use-media-query';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ResizableDelta, Position } from 'react-rnd';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

import { useTemplate, ShapeType, TemplateProvider } from './contexts/TemplateContext';
import TemplateSelector from './components/TemplateSelector';
import ThumbnailText from './components/ThumbnailText';
import ThumbnailImage from './components/ThumbnailImage';
import ThumbnailShape from './components/ThumbnailShape';
import { UnifiedLayerPanel } from '@/components/shared/UnifiedLayerPanel';
import { EnhancedPropertyPanel } from './components/EnhancedPropertyPanel';
import { Toolbar } from './components/Toolbar';
import { EnhancedPreview, usePreviewKeyboardShortcuts } from './components/EnhancedPreview';
import { useCanvasOperations } from './hooks/useCanvasOperations';
import { AssetExportSettingsPanel, AssetExportSettings } from './components/AssetExportSettingsPanel';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function AssetCreatorPage() {
  // UI状態管理
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });
  const [selectedTab, setSelectedTab] = React.useState("settings");
  const [isShiftKeyDown, setIsShiftKeyDown] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isPreviewDedicatedMode, setIsPreviewDedicatedMode] = React.useState(false);
  
  // プレビュー設定の状態
  const [showGrid, setShowGrid] = React.useState(false);
  const [showAspectGuide, setShowAspectGuide] = React.useState(true);
  const [showSafeArea, setShowSafeArea] = React.useState(false);
  const [gridSize, setGridSize] = React.useState(20);
  
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
  } = useTemplate();

  const selectedLayer = layers.find(layer => layer.id === selectedLayerId);

  // プレビューエリアのサイズ計算
  const getPreviewSize = React.useCallback(() => {
    if (!isDesktop) {
      // モバイル表示：画面幅を最大限活用しつつ、高さも制限
      if (isPreviewDedicatedMode) {
        // フルスクリーン表示時は画面幅の95%を使用
        return { width: '95vw', maxWidth: 'none', maxHeight: '80vh' };
      }
      // 通常表示時は画面幅の90%を使用（サイドバー分を考慮）
      return { width: '90vw', maxWidth: 'none', maxHeight: '40vh' };
    }

    let size;
    // プレビュー専用モード
    if (isPreviewDedicatedMode) {
      size = { width: 'min(2000px, 95vw)', maxWidth: 'none' };
    }
    // サイドバーの状態に応じて動的調整
    else if (isSidebarOpen) {
      size = { width: 'min(1500px, 75vw)', maxWidth: 'none' };
    } else {
      size = { width: 'min(1800px, 90vw)', maxWidth: 'none' };
    }

    console.log('Preview size:', { isDesktop, isPreviewDedicatedMode, isSidebarOpen, size });
    return size;
  }, [isDesktop, isPreviewDedicatedMode, isSidebarOpen]);

  // キャンバス操作機能
  const {
    zoom,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    addToHistory,
    resetHistoryFlag,
    saveToLocalStorage,
    loadFromLocalStorage,
  } = useCanvasOperations(layers, selectedLayerId);

  // キー入力のイベントハンドラー
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftKeyDown(true);
      
      // キーボードショートカット
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              const redoState = redo();
              if (redoState) {
                // TODO: レイヤー状態を復元
                resetHistoryFlag();
              }
            } else {
              const undoState = undo();
              if (undoState) {
                // TODO: レイヤー状態を復元
                resetHistoryFlag();
              }
            }
            break;
          case 'y':
            e.preventDefault();
            const redoState = redo();
            if (redoState) {
              // TODO: レイヤー状態を復元
              resetHistoryFlag();
            }
            break;
          case 's':
            e.preventDefault();
            const saved = saveToLocalStorage(layers, selectedLayerId);
            if (saved) {
              toast.success('プロジェクトを保存しました');
            } else {
              toast.error('保存に失敗しました');
            }
            break;
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftKeyDown(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo, resetHistoryFlag, saveToLocalStorage, layers, selectedLayerId]);

  // デスクトップ表示時は初期状態でサイドバーを開く
  React.useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

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
      const promises = settings.batchSizes.map(async (size) => {
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
      console.error('Batch export failed:', error);
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
      console.error('Export failed:', error);
      toast.error('エクスポートに失敗しました');
    }
  }, [handleAdvancedExport]);

  // レイヤーのドラッグ＆リサイズハンドラー
  const handleLayerDragStop = React.useCallback((id: string, _: unknown, d: Position) => {
    updateLayer(id, { x: d.x, y: d.y });
    // 履歴に追加
    setTimeout(() => addToHistory(layers, selectedLayerId), 0);
  }, [updateLayer, addToHistory, layers, selectedLayerId]);

  const handleLayerResize = React.useCallback((id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    updateLayer(id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
    // 履歴に追加
    setTimeout(() => addToHistory(layers, selectedLayerId), 0);
  }, [updateLayer, addToHistory, layers, selectedLayerId]);

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
      });
    }
    e.target.value = '';
  };

  const handleAddShape = (shapeType: ShapeType) => {
    const offset = layers.filter(l => l.type === 'shape').length * (isDesktop ? 20 : 5);
    const shapeCount = layers.filter(l => l.shapeType === shapeType).length + 1;
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

    addLayer({
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
    });
    // 履歴に追加
    setTimeout(() => addToHistory(layers, selectedLayerId), 0);
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
    });
    // 履歴に追加
    setTimeout(() => addToHistory(layers, selectedLayerId), 0);
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

  // アンドゥ・リドゥハンドラー
  const handleUndo = React.useCallback(() => {
    const undoState = undo();
    if (undoState) {
      // TODO: レイヤー状態を復元する処理を実装
      resetHistoryFlag();
      toast.success('操作を元に戻しました');
    }
  }, [undo, resetHistoryFlag]);

  const handleRedo = React.useCallback(() => {
    const redoState = redo();
    if (redoState) {
      // TODO: レイヤー状態を復元する処理を実装
      resetHistoryFlag();
      toast.success('操作をやり直しました');
    }
  }, [redo, resetHistoryFlag]);

  if (!selectedTemplate) {
    return <div className="flex h-full items-center justify-center"><p>テンプレートを読み込み中...</p></div>;
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
      {selectedLayer?.type === 'text' && (
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">フォントサイズ</Label>
                <Slider
                  value={[parseFloat(selectedLayer.fontSize?.replace('rem', '') || '2')]}
                  onValueChange={([value]) => updateLayer(selectedLayer.id, { fontSize: `${value}rem` })}
                  min={0.5}
                  max={8}
                  step={0.1}
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 text-center mt-1">
                  {selectedLayer.fontSize || '2rem'}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">色</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={selectedLayer.color || '#ffffff'}
                    onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                  <Input
                    value={selectedLayer.color || '#ffffff'}
                    onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 画像レイヤーの設定 */}
      {selectedLayer?.type === 'image' && (
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
              <div className="text-xs text-gray-500 text-center mt-1">
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
              <div className="text-xs text-gray-500 text-center mt-1">
                {selectedLayer.rotation || 0}°
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 図形レイヤーの設定 */}
      {selectedLayer?.type === 'shape' && (
        <div className="space-y-4">
          <h4 className="font-medium">図形設定</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">図形の種類</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button 
                  variant={selectedLayer.shapeType === 'rectangle' ? 'default' : 'outline'}
                  onClick={() => updateLayer(selectedLayer.id, { shapeType: 'rectangle' })}
                  size="sm"
                >
                  四角形
                </Button>
                <Button 
                  variant={selectedLayer.shapeType === 'circle' ? 'default' : 'outline'}
                  onClick={() => updateLayer(selectedLayer.id, { shapeType: 'circle' })}
                  size="sm"
                >
                  円
                </Button>
                <Button 
                  variant={selectedLayer.shapeType === 'line' ? 'default' : 'outline'}
                  onClick={() => updateLayer(selectedLayer.id, { shapeType: 'line' })}
                  size="sm"
                >
                  線
                </Button>
                <Button 
                  variant={selectedLayer.shapeType === 'arrow' ? 'default' : 'outline'}
                  onClick={() => updateLayer(selectedLayer.id, { shapeType: 'arrow' })}
                  size="sm"
                >
                  矢印
                </Button>
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
                    className="w-8 h-8 rounded border border-gray-300"
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
                    className="w-8 h-8 rounded border border-gray-300"
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
              <div className="text-xs text-gray-500 text-center mt-1">
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
    </div>
  );

  // サイドバーコンテンツ
  const sidebarContent = (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="settings">テンプレート</TabsTrigger>
        <TabsTrigger value="tools">ツール</TabsTrigger>
        <TabsTrigger value="layers">レイヤー</TabsTrigger>
        <TabsTrigger value="export">エクスポート</TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="mt-4">
        <TemplateSelector onSelectTemplate={setSelectedTemplate} selectedTemplateId={selectedTemplate.id} />
      </TabsContent>
      <TabsContent value="tools" className="mt-4">
        {renderToolsPanel()}
      </TabsContent>
      <TabsContent value="layers" className="mt-4">
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
      </TabsContent>
      <TabsContent value="export" className="mt-4">
        <AssetExportSettingsPanel 
          onExport={(element, settings) => {
            if (settings.batchExport && settings.batchSizes.length > 0) {
              return handleBatchExport(element, settings);
            } else {
              return handleAdvancedExport(element, settings);
            }
          }}
          isExporting={isExporting}
        />
      </TabsContent>
    </Tabs>
  );

  // モバイル用のサイドバーコンテンツ（テンプレートとエクスポートのみ）
  const mobileSidebarContent = (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-12">
        <TabsTrigger value="settings" className="text-xs">テンプレート</TabsTrigger>
        <TabsTrigger value="export" className="text-xs">エクスポート</TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="mt-4">
        <TemplateSelector onSelectTemplate={setSelectedTemplate} selectedTemplateId={selectedTemplate.id} />
      </TabsContent>
      <TabsContent value="export" className="mt-4">
        <AssetExportSettingsPanel 
          onExport={(element, settings) => {
            if (settings.batchExport && settings.batchSizes.length > 0) {
              return handleBatchExport(element, settings);
            } else {
              return handleAdvancedExport(element, settings);
            }
          }}
          isExporting={isExporting}
        />
      </TabsContent>
    </Tabs>
  );

  const renderPreview = () => {
    const getAspectRatio = () => {
      if (aspectRatio === 'custom') {
        return `${customAspectRatio.width} / ${customAspectRatio.height}`;
      }
      return aspectRatio.replace(':', ' / ');
    };

    return (
      <>
        {/* ツールバー - デスクトップのみ表示 */}
        {isDesktop && (
          <Toolbar
            zoom={zoom}
            setZoom={setZoom}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSave={handleSave}
            onDownload={handleDownloadThumbnail}
            canUndo={canUndo}
            canRedo={canRedo}
            isPreviewDedicatedMode={isPreviewDedicatedMode}
            onTogglePreviewMode={() => setIsPreviewDedicatedMode(!isPreviewDedicatedMode)}
          />
        )}
        
        {/* モバイル表示でのフルスクリーン表示時の戻るボタン */}
        {!isDesktop && isPreviewDedicatedMode && (
          <div className="absolute top-2 left-2 z-20">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPreviewDedicatedMode(false)}
              className="bg-background/90 backdrop-blur-sm shadow-lg"
            >
              <Minimize2 className="h-4 w-4 mr-1" />
              通常表示に戻る
            </Button>
          </div>
        )}
        
        {/* プレビューエリア */}
        <div className={`${isDesktop ? 'flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 relative' : 'flex-shrink-0 bg-gray-100 dark:bg-gray-900 relative max-h-[50vh] overflow-auto'}`}>
          <div className={`${isDesktop ? 'flex items-center justify-center h-full p-4 lg:p-8' : 'flex items-center justify-center p-4'}`}>
            <EnhancedPreview
              zoom={zoom}
              onZoomReset={() => setZoom(1)}
              className="w-full"
              aspectRatio={aspectRatio}
              customAspectRatio={customAspectRatio}
              showGrid={showGrid}
              setShowGrid={setShowGrid}
              showAspectGuide={showAspectGuide}
              setShowAspectGuide={setShowAspectGuide}
              showSafeArea={showSafeArea}
              setShowSafeArea={setShowSafeArea}
              gridSize={gridSize}
              setGridSize={setGridSize}
            >
            <div
              id="thumbnail-preview"
              style={{ 
                aspectRatio: getAspectRatio(),
                ...getPreviewSize()
              }}
              className="bg-card relative border rounded-md shadow-lg"
            >
          <div id="download-target" className="w-full h-full relative overflow-hidden">
            {layers.map((layer) => {
              const isSelected = layer.id === selectedLayerId;
              const isDraggable = isSelected && !layer.locked;
              const isResizable = isSelected && !layer.locked;

              if (!layer.visible) return null;

              if (layer.type === 'image') {
                return (
                  <ThumbnailImage
                    key={layer.id} id={layer.id} isSelected={isSelected} src={layer.src || ''} alt={layer.name}
                    x={layer.x} y={layer.y} width={layer.width} height={layer.height} rotation={layer.rotation}
                    onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                    onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    lockAspectRatio={isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
                    onSelect={() => setSelectedLayerId(layer.id)}
                    isLocked={layer.locked}
                    isDraggable={isDraggable}
                    onRotateStart={() => {}} 
                    onRotate={() => {}} 
                    onRotateStop={() => {}}
                    isBackground={layer.isBackground}
                    zIndex={layer.zIndex}
                  />
                );
              } else if (layer.type === 'text') {
                return (
                  <ThumbnailText
                    key={layer.id} id={layer.id} isSelected={isSelected} text={layer.text || ''} color={layer.color || '#000000'}
                    fontSize={layer.fontSize || '1rem'} x={layer.x} y={layer.y} width={layer.width} height={layer.height}
                    rotation={layer.rotation} onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                    onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    enableResizing={isResizable} disableDragging={!isDraggable}
                    zIndex={layer.zIndex}
                  />
                );
              } else if (layer.type === 'shape' && layer.shapeType) {
                return (
                  <ThumbnailShape
                    key={layer.id} id={layer.id} isSelected={isSelected} shapeType={layer.shapeType}
                    backgroundColor={layer.backgroundColor || '#cccccc'} borderColor={layer.borderColor || '#000000'}
                    borderWidth={layer.borderWidth || 0} x={layer.x} y={layer.y} width={layer.width} height={layer.height}
                    rotation={layer.rotation} onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                    onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    lockAspectRatio={isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
                    zIndex={layer.zIndex}
                  />
                );
              }
              return null;
            })}
          </div>
              </div>
            </EnhancedPreview>
          </div>
        </div>
      </>
    );
  };

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
                <p className="text-sm font-medium">{selectedLayer.name}</p>
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
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(1)}
                  className="w-full h-8"
                >
                  ズームリセット (100%)
                </Button>
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
      {/* モバイル用オーバーレイ（サイドバーが開いている時のみ表示） */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row flex-grow lg:h-full">
        <main className="flex-1 flex flex-col lg:h-full p-2 pt-16 lg:p-4 lg:pt-4">
          <div className={`${isDesktop ? 'flex-1 flex flex-col min-h-[600px] lg:min-h-0' : 'flex-shrink-0'}`}>
            {renderPreview()}
          </div>
          
          {/* モバイル用コントロール - プレビュー専用モード時は非表示 */}
          {!isDesktop && !isPreviewDedicatedMode && (
            <div className="border-t bg-background/95 backdrop-blur-sm">
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2">
                  💡 ヒント: 「ツール設定」でレイヤーの詳細編集、「レイヤー管理」でレイヤーの並び替えができます。テンプレートやエクスポートはサイドバーからアクセスできます。
                </p>
              </div>
              {renderMobileControls()}
            </div>
          )}
        </main>

        {/* サイドバーが閉じている場合の開くボタン */}
        {!isSidebarOpen && (
          <SidebarToggle
            onOpen={() => setIsSidebarOpen(true)}
            isDesktop={isDesktop}
            tabs={[
              { id: "settings", label: "テンプレート", icon: <Settings className="h-4 w-4" /> },
              { id: "tools", label: "ツール", icon: <Construction className="h-4 w-4" /> },
              { id: "layers", label: "レイヤー", icon: <Layers className="h-4 w-4" /> }
            ]}
            onTabClick={(tabId) => {
              // タブの状態管理が必要な場合はここで実装
              console.log('Tab clicked:', tabId);
            }}
          />
        )}

        {/* サイドバー（プレビュー専用モード時は非表示） */}
        {!isPreviewDedicatedMode && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            title=""
            isDesktop={isDesktop}
            className={`${isDesktop ? 'lg:w-96' : 'w-full max-w-sm'}`}
          >
            {isDesktop ? sidebarContent : mobileSidebarContent}
          </Sidebar>
        )}
      </div>
    </div>
  );
}

// TemplateProviderでラップしたコンポーネント
export default function AssetCreatorPageWithProvider() {
  return (
    <TemplateProvider>
      <AssetCreatorPage />
    </TemplateProvider>
  );
}