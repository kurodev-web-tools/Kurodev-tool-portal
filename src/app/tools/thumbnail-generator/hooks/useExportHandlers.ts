import { useState } from 'react';
import { toPng } from 'html-to-image';
import { toast } from "sonner";
import { ExportSettings } from '../components/ExportSettingsPanel';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export interface ExportHandlers {
  // エクスポート状態
  isExporting: boolean;
  setIsExporting: (exporting: boolean) => void;

  // エクスポートハンドラー
  handleAdvancedExport: (settings: ExportSettings) => Promise<void>;
  handleSingleExport: (element: HTMLElement, settings: ExportSettings) => Promise<void>;
  handleBatchExport: (element: HTMLElement, settings: ExportSettings) => Promise<void>;
  handleDownloadThumbnail: (quality?: 'normal' | 'high' | 'super') => Promise<void>;
}

/**
 * エクスポート機能を管理するフック
 * 画像のエクスポート、ダウンロード、バッチ処理を担当
 */
export const useExportHandlers = (): ExportHandlers => {
  const [isExporting, setIsExporting] = useState(false);

  // 高度なエクスポート機能
  const handleAdvancedExport = async (settings: ExportSettings) => {
    try {
      console.log('handleAdvancedExport called with settings:', settings);
      setIsExporting(true);
      
      const element = document.getElementById('thumbnail-preview') as HTMLElement;
      console.log('Found element:', element);
      if (!element) {
        toast.error('プレビュー要素が見つかりません');
        return;
      }

      if (settings.batchExport) {
        console.log('Executing batch export');
        await handleBatchExport(element, settings);
      } else {
        console.log('Executing single export');
        await handleSingleExport(element, settings);
      }
    } catch (error) {
      console.error('エクスポートエラー:', error);
      toast.error('エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  // 単一エクスポート
  const handleSingleExport = async (element: HTMLElement, settings: ExportSettings) => {
    try {
      // 品質プリセットのマッピング
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
        cacheBust: false,
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
        filename = 'thumbnail.png';
      } else if (settings.format === 'jpeg') {
        const { toJpeg } = await import('html-to-image');
        dataUrl = await toJpeg(element, exportOptions);
        filename = 'thumbnail.jpg';
      } else {
        // WebPはサポートされていないため、PNGを使用
        dataUrl = await toPng(element, exportOptions);
        filename = 'thumbnail.png';
      }

      // ダウンロード
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toast.success('エクスポートが完了しました');
    } catch (error) {
      console.error('単一エクスポートエラー:', error);
      throw error;
    }
  };

  // バッチエクスポート
  const handleBatchExport = async (element: HTMLElement, settings: ExportSettings) => {
    try {
      console.log('handleBatchExport called with settings:', settings);
      // バッチサイズが設定されている場合は、それを使用
      if (settings.batchSizes && settings.batchSizes.length > 0) {
        console.log('Processing batch sizes:', settings.batchSizes);
        const promises = settings.batchSizes.map(async (size, index) => {
          console.log(`Processing batch ${index + 1}/${settings.batchSizes.length}:`, size);
          // 品質プリセットのマッピング
          const qualityPreset = {
            low: { pixelRatio: 1, quality: 0.6 },
            medium: { pixelRatio: 1.5, quality: 0.8 },
            high: { pixelRatio: 2, quality: 0.9 },
            ultra: { pixelRatio: 3, quality: 1.0 }
          }[settings.quality];

          // エクスポート設定
          const exportOptions = {
            cacheBust: false,
            pixelRatio: settings.pixelRatio || qualityPreset.pixelRatio,
            quality: settings.format === 'png' ? 1.0 : qualityPreset.quality,
            backgroundColor: settings.backgroundColor || '#ffffff',
            width: size.width,
            height: size.height,
            style: {
              transform: 'scale(1)',
              transformOrigin: 'top left',
            }
          };

          let dataUrl: string;
          let filename: string;

          // 形式に応じてエクスポート
          if (settings.format === 'png') {
            console.log(`Exporting PNG for ${size.name}`);
            dataUrl = await toPng(element, exportOptions);
            filename = `thumbnail_${size.name}.png`;
          } else if (settings.format === 'jpeg') {
            console.log(`Exporting JPEG for ${size.name}`);
            const { toJpeg } = await import('html-to-image');
            dataUrl = await toJpeg(element, exportOptions);
            filename = `thumbnail_${size.name}.jpg`;
          } else {
            // WebPはサポートされていないため、PNGを使用
            console.log(`Exporting PNG (WebP fallback) for ${size.name}`);
            dataUrl = await toPng(element, exportOptions);
            filename = `thumbnail_${size.name}.png`;
          }

          // ダウンロード
          console.log(`Creating download link for ${filename}`);
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          link.click();

          return filename;
        });

        console.log('Waiting for all batch exports to complete...');
        const filenames = await Promise.all(promises);
        console.log('All batch exports completed:', filenames);
        toast.success(`${filenames.length}件のエクスポートが完了しました`);
      } else {
        // バッチサイズが設定されていない場合は、品質と形式の組み合わせでエクスポート
        const formats = [settings.format];
        const qualities = [settings.quality];
        
        for (const format of formats) {
          for (const quality of qualities) {
            // 品質プリセットのマッピング
            const qualityPreset = {
              low: { pixelRatio: 1, quality: 0.6 },
              medium: { pixelRatio: 1.5, quality: 0.8 },
              high: { pixelRatio: 2, quality: 0.9 },
              ultra: { pixelRatio: 3, quality: 1.0 }
            }[quality];

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
              cacheBust: false,
              pixelRatio: settings.pixelRatio || qualityPreset.pixelRatio,
              quality: format === 'png' ? 1.0 : qualityPreset.quality,
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
            if (format === 'png') {
              dataUrl = await toPng(element, exportOptions);
              filename = `thumbnail_${quality}.png`;
            } else if (format === 'jpeg') {
              const { toJpeg } = await import('html-to-image');
              dataUrl = await toJpeg(element, exportOptions);
              filename = `thumbnail_${quality}.jpg`;
            } else {
              // WebPはサポートされていないため、PNGを使用
              dataUrl = await toPng(element, exportOptions);
              filename = `thumbnail_${quality}.png`;
            }

            // ダウンロード
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();
          }
        }

        console.log('Fallback batch export completed');
        toast.success(`${formats.length * qualities.length}件のエクスポートが完了しました`);
      }
    } catch (error) {
      console.error('バッチエクスポートエラー:', error);
      throw error;
    } finally {
      console.log('Batch export completed, resetting isExporting state');
    }
  };

  // サムネイルダウンロード（既存機能）
  const handleDownloadThumbnail = async (quality: 'normal' | 'high' | 'super' = 'high') => {
    try {
      console.log('handleDownloadThumbnail called with quality:', quality);
      setIsExporting(true);
      
      const element = document.getElementById('thumbnail-preview') as HTMLElement;
      console.log('Found element for download:', element);
      if (!element) {
        toast.error('プレビュー要素が見つかりません');
        return;
      }

      const qualityMap = {
        normal: 0.8,
        high: 1.0,
        super: 2.0
      };

      console.log('Starting PNG export with quality:', qualityMap[quality]);
      const dataUrl = await toPng(element, {
        quality: qualityMap[quality],
        pixelRatio: qualityMap[quality],
        backgroundColor: '#ffffff',
      });

      console.log('PNG export completed, creating download link');
      const link = document.createElement('a');
      link.download = `thumbnail_${quality}.png`;
      link.href = dataUrl;
      link.click();

      toast.success(`${quality}品質でサムネイルをダウンロードしました`);
    } catch (error) {
      console.error('サムネイルダウンロードエラー:', error);
      toast.error('ダウンロードに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    setIsExporting,
    handleAdvancedExport,
    handleSingleExport,
    handleBatchExport,
    handleDownloadThumbnail,
  };
};
