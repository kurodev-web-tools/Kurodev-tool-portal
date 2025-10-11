/**
 * アセットエディターのイベントハンドラーカスタムフック
 * エクスポート、レイヤー操作、画像アップロードなどのハンドラーを管理
 */

import React from 'react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { ResizableDelta, Position } from 'react-rnd';
import { logger } from '@/lib/logger';
import { AssetExportSettings } from '../components/AssetExportSettingsPanel';
import { ShapeType, Layer } from '../contexts/TemplateContext';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export interface UseAssetEditorHandlersParams {
  // State
  setIsExporting: (value: boolean) => void;
  aspectRatio: string;
  customAspectRatio: { width: number; height: number };
  layers: Layer[];
  selectedLayerId: string | null;
  currentText: string;
  isDesktop: boolean;
  
  // Template functions
  addLayer: (layer: Omit<Layer, 'id' | 'rotation' | 'zIndex'>) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  
  // Canvas operations
  addToHistory: (layers: Layer[], selectedLayerId: string | null) => void;
  undo: () => unknown;
  redo: () => unknown;
  resetHistoryFlag: () => void;
  saveToLocalStorage: (layers: Layer[], selectedLayerId: string | null) => boolean;
  
  // Error handling
  handleAsyncError: <T>(asyncFn: () => Promise<T>, errorMessage?: string) => Promise<T | null>;
}

export interface AssetEditorHandlers {
  handleAdvancedExport: (element: HTMLElement, settings: AssetExportSettings) => Promise<void>;
  handleBatchExport: (element: HTMLElement, settings: AssetExportSettings) => Promise<void>;
  handleDownloadThumbnail: (qualityLevel: 'normal' | 'high' | 'super') => Promise<void>;
  handleLayerDragStop: (id: string, _: unknown, d: Position) => void;
  handleLayerResize: (id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddShape: (shapeType: ShapeType) => void;
  handleAddText: () => void;
  handleSave: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
}

/**
 * アセットエディターのイベントハンドラーフック
 */
export const useAssetEditorHandlers = (params: UseAssetEditorHandlersParams): AssetEditorHandlers => {
  const {
    setIsExporting,
    aspectRatio,
    customAspectRatio,
    layers,
    selectedLayerId,
    currentText,
    isDesktop,
    addLayer,
    updateLayer,
    addToHistory,
    undo,
    redo,
    resetHistoryFlag,
    saveToLocalStorage,
    handleAsyncError,
  } = params;

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
  }, [aspectRatio, customAspectRatio, handleAsyncError, setIsExporting]);

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
      logger.error('Batch export failed', error, 'AssetCreator');
      toast.error('バッチエクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  }, [setIsExporting]);

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

  const handleImageUpload = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [addLayer, isDesktop]);

  const handleAddShape = React.useCallback((shapeType: ShapeType) => {
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
  }, [addLayer, layers, isDesktop, addToHistory, selectedLayerId]);

  const handleAddText = React.useCallback(() => {
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
  }, [addLayer, layers, currentText, isDesktop, addToHistory, selectedLayerId]);

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

  return {
    handleAdvancedExport,
    handleBatchExport,
    handleDownloadThumbnail,
    handleLayerDragStop,
    handleLayerResize,
    handleImageUpload,
    handleAddShape,
    handleAddText,
    handleSave,
    handleUndo,
    handleRedo,
  };
};

