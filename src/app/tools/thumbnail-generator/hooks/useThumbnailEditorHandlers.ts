/**
 * サムネイルエディターのイベントハンドラーカスタムフック
 * エクスポート、レイヤー操作、画像アップロードなどのハンドラーを管理
 */

import React from 'react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { ResizableDelta, Position } from 'react-rnd';
import { logger } from '@/lib/logger';
import { ExportSettings } from '../components/ExportSettingsPanel';
import { ShapeType, Layer } from '../contexts/TemplateContext';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export interface UseThumbnailEditorHandlersParams {
  // State
  setIsExporting: (value: boolean) => void;
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

export interface ThumbnailEditorHandlers {
  handleAdvancedExport: (settings: ExportSettings) => Promise<void>;
  handleLayerDragStop: (id: string, _: unknown, d: Position) => void;
  handleLayerResize: (id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddShape: (shapeType: ShapeType) => void;
  handleAddText: () => void;
  handleSave: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleDownloadThumbnail: (qualityLevel: 'normal' | 'high' | 'super') => Promise<void>;
}

/**
 * サムネイルエディターのイベントハンドラーフック
 */
export const useThumbnailEditorHandlers = (params: UseThumbnailEditorHandlersParams): ThumbnailEditorHandlers => {
  const {
    setIsExporting,
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

  // 画像の読み込み完了を待つ
  const waitForImagesToLoad = React.useCallback(async (element: HTMLElement): Promise<void> => {
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
  }, []);

  // 単一エクスポート
  const handleSingleExport = React.useCallback(async (element: HTMLElement, settings: ExportSettings) => {
    // 画像の読み込み完了を待つ
    await waitForImagesToLoad(element);
    const qualityPreset = {
      low: { pixelRatio: 1, quality: 0.6 },
      medium: { pixelRatio: 1.5, quality: 0.8 },
      high: { pixelRatio: 2, quality: 0.9 },
      ultra: { pixelRatio: 3, quality: 1.0 }
    }[settings.quality];

    // 解像度の計算
    const resolution = settings.resolution === 'custom' 
      ? { width: settings.customWidth || 1920, height: settings.customHeight || 1080 }
      : {
          hd: { width: 1280, height: 720 },
          fhd: { width: 1920, height: 1080 },
          '4k': { width: 3840, height: 2160 }
        }[settings.resolution];

    // エクスポート設定
    const exportOptions = {
      cacheBust: false, // キャッシュバストを無効化して画像の読み込みを確実にする
      pixelRatio: settings.pixelRatio || qualityPreset.pixelRatio,
      quality: settings.format === 'png' ? 1.0 : qualityPreset.quality,
      backgroundColor: settings.backgroundColor || '#ffffff',
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
      filename = `thumbnail-${settings.optimizeForPlatform}-${resolution.width}x${resolution.height}.png`;
    } else if (settings.format === 'jpeg') {
      const { toJpeg } = await import('html-to-image');
      dataUrl = await toJpeg(element, exportOptions);
      filename = `thumbnail-${settings.optimizeForPlatform}-${resolution.width}x${resolution.height}.jpg`;
    } else {
      // WebPはサポートされていないため、PNGを使用
      dataUrl = await toPng(element, exportOptions);
      filename = `thumbnail-${settings.optimizeForPlatform}-${resolution.width}x${resolution.height}.png`;
    }

    // ダウンロード
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    toast.success(`${filename} をエクスポートしました`);
  }, [waitForImagesToLoad]);

  // バッチエクスポート
  const handleBatchExport = React.useCallback(async (element: HTMLElement, settings: ExportSettings) => {
    const promises = settings.batchSizes.map(async (size) => {
      const exportOptions = {
        cacheBust: true,
        pixelRatio: settings.pixelRatio || 2,
        quality: settings.format === 'png' ? 1.0 : 0.9,
        backgroundColor: settings.backgroundColor || '#ffffff',
        width: size.width,
        height: size.height
      };

      let dataUrl: string;
      let filename: string;

      if (settings.format === 'png') {
        dataUrl = await toPng(element, exportOptions);
        filename = `thumbnail-${size.platform}-${size.width}x${size.height}.png`;
      } else if (settings.format === 'jpeg') {
        const { toJpeg } = await import('html-to-image');
        dataUrl = await toJpeg(element, exportOptions);
        filename = `thumbnail-${size.platform}-${size.width}x${size.height}.jpg`;
      } else {
        // WebPはサポートされていないため、PNGを使用
        dataUrl = await toPng(element, exportOptions);
        filename = `thumbnail-${size.platform}-${size.width}x${size.height}.png`;
      }

      // ダウンロード
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      return filename;
    });

    const filenames = await Promise.all(promises);
    toast.success(`${filenames.length}個のファイルをエクスポートしました`);
  }, []);

  // 高度なエクスポート処理
  const handleAdvancedExport = React.useCallback(async (settings: ExportSettings) => {
    const thumbnailElement = document.getElementById('thumbnail-preview');
    if (!thumbnailElement) {
      toast.error('サムネイルが見つかりません');
      return;
    }

    setIsExporting(true);
    
    try {
      await handleAsyncError(async () => {
        if (settings.batchExport) {
          // バッチエクスポート
          await handleBatchExport(thumbnailElement, settings);
        } else {
          // 単一エクスポート
          await handleSingleExport(thumbnailElement, settings);
        }
      }, "エクスポートに失敗しました");
    } finally {
      setIsExporting(false);
    }
  }, [handleAsyncError, handleSingleExport, handleBatchExport, setIsExporting]);

  // サムネイルのダウンロード処理（ツールバー用）
  const handleDownloadThumbnail = React.useCallback(async (qualityLevel: 'normal' | 'high' | 'super') => {
    const element = document.getElementById('download-target');
    if (!element) {
      toast.error('プレビューエリアが見つかりません');
      return;
    }

    try {
      const settings: ExportSettings = {
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
      
      await handleSingleExport(element, settings);
    } catch (error) {
      logger.error('Export failed', error, 'ThumbnailGenerator');
      toast.error('エクスポートに失敗しました');
    }
  }, [handleSingleExport]);

  // レイヤーのドラッグ＆リサイズハンドラー
  const handleLayerDragStop = React.useCallback((id: string, _: unknown, d: Position) => {
    updateLayer(id, { x: d.x, y: d.y });
    addToHistory(layers, selectedLayerId);
  }, [updateLayer, addToHistory, layers, selectedLayerId]);

  const handleLayerResize = React.useCallback((id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    updateLayer(id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
    addToHistory(layers, selectedLayerId);
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
      } as any);
    }
    e.target.value = '';
  }, [addLayer, isDesktop]);

  const handleAddShape = React.useCallback((shapeType: ShapeType) => {
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
    } as any);
  }, [addLayer, layers, isDesktop]);

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
      // フォント設定はaddLayer関数内でcurrentFontSettingsから自動適用される
    } as any);
  }, [addLayer, layers, currentText, isDesktop]);

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
      resetHistoryFlag();
      toast.success('操作を元に戻しました');
    }
  }, [undo, resetHistoryFlag]);

  const handleRedo = React.useCallback(() => {
    const redoState = redo();
    if (redoState) {
      resetHistoryFlag();
      toast.success('操作をやり直しました');
    }
  }, [redo, resetHistoryFlag]);

  return {
    handleAdvancedExport,
    handleLayerDragStop,
    handleLayerResize,
    handleImageUpload,
    handleAddShape,
    handleAddText,
    handleSave,
    handleUndo,
    handleRedo,
    handleDownloadThumbnail,
  };
};

