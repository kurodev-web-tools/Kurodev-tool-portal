/**
 * 画像フォーマット関連のユーティリティ関数
 */

/**
 * WebP対応チェック
 * @returns WebP対応の場合 true
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * AVIF対応チェック
 * @returns AVIF対応の場合 true
 */
export const supportsAVIF = (): boolean => {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

/**
 * 最適な画像フォーマットを決定
 * @param originalFormat 元のフォーマット（拡張子）
 * @returns 最適なフォーマット（'avif', 'webp', または元のフォーマット）
 */
export const getOptimalFormat = (originalFormat: string): string => {
  if (typeof window === 'undefined') return originalFormat;

  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return originalFormat;
};

/**
 * 画像フォーマットの妥当性をチェック
 * @param file ファイルオブジェクト
 * @returns 妥当な場合 true
 */
export const validateImageFormat = (file: File): boolean => {
  const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];
  return validFormats.includes(file.type);
};

/**
 * ファイル拡張子から画像フォーマットか判定
 * @param filename ファイル名
 * @returns 画像ファイルの場合 true
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|avif|bmp|ico)$/i;
  return imageExtensions.test(filename);
};

/**
 * フォーマット文字列からMIMEタイプを取得
 * @param format フォーマット（'jpeg', 'png', 'webp', 'avif'等）
 * @returns MIMEタイプ（例: 'image/jpeg'）
 */
export const getImageMimeType = (format: string): string => {
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    avif: 'image/avif',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
  };

  return mimeTypes[format.toLowerCase()] || 'image/jpeg';
};

/**
 * MIMEタイプから拡張子を取得
 * @param mimeType MIMEタイプ（例: 'image/jpeg'）
 * @returns 拡張子（例: 'jpg'）
 */
export const getExtensionFromMimeType = (mimeType: string): string => {
  const extensions: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
    'image/bmp': 'bmp',
    'image/x-icon': 'ico',
  };

  return extensions[mimeType.toLowerCase()] || 'jpg';
};

/**
 * 画像ファイルサイズをバイトから人間が読みやすい形式に変換
 * @param bytes バイト数
 * @returns 読みやすい形式（例: '1.5 MB'）
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 画像サイズが妥当か検証
 * @param width 幅
 * @param height 高さ
 * @param maxWidth 最大幅（デフォルト: 4096）
 * @param maxHeight 最大高さ（デフォルト: 4096）
 * @param minWidth 最小幅（デフォルト: 1）
 * @param minHeight 最小高さ（デフォルト: 1）
 * @returns 妥当な場合 true
 */
export const validateImageSize = (
  width: number,
  height: number,
  maxWidth: number = 4096,
  maxHeight: number = 4096,
  minWidth: number = 1,
  minHeight: number = 1
): boolean => {
  return (
    width >= minWidth &&
    width <= maxWidth &&
    height >= minHeight &&
    height <= maxHeight
  );
};

/**
 * フォーマットに応じた推奨品質を取得
 * @param format フォーマット（'jpeg', 'webp', 'avif'等）
 * @param quality ユーザー指定品質（0-100、未指定時は推奨値を返す）
 * @returns 品質（0-1）
 */
export const getRecommendedQuality = (format: string, quality?: number): number => {
  if (quality !== undefined) {
    return Math.max(0, Math.min(100, quality)) / 100;
  }

  const recommendedQualities: { [key: string]: number } = {
    jpeg: 0.85,
    jpg: 0.85,
    webp: 0.85,
    avif: 0.80,
    png: 1.0, // PNGは通常ロスレス
  };

  return recommendedQualities[format.toLowerCase()] || 0.85;
};

/**
 * 画像の推奨エクスポート設定を取得
 * @param usage 用途（'web', 'print', 'thumbnail', 'social'）
 * @returns 推奨設定
 */
export const getRecommendedExportSettings = (
  usage: 'web' | 'print' | 'thumbnail' | 'social'
): {
  format: string;
  quality: number;
  maxWidth: number;
  maxHeight: number;
} => {
  const settings = {
    web: {
      format: getOptimalFormat('jpeg'),
      quality: 0.85,
      maxWidth: 1920,
      maxHeight: 1080,
    },
    print: {
      format: 'png',
      quality: 1.0,
      maxWidth: 4096,
      maxHeight: 4096,
    },
    thumbnail: {
      format: getOptimalFormat('jpeg'),
      quality: 0.75,
      maxWidth: 320,
      maxHeight: 180,
    },
    social: {
      format: 'jpeg',
      quality: 0.9,
      maxWidth: 1200,
      maxHeight: 630,
    },
  };

  return settings[usage];
};

/**
 * Base64データURLからフォーマットを抽出
 * @param dataUrl データURL
 * @returns フォーマット（例: 'jpeg', 'png'）
 */
export const getFormatFromDataUrl = (dataUrl: string): string | null => {
  const match = dataUrl.match(/^data:image\/([a-zA-Z]+);/);
  if (!match || !match[1]) {
    return null;
  }
  return match[1].toLowerCase();
};

/**
 * 画像フォーマットが透明度をサポートしているか判定
 * @param format フォーマット
 * @returns 透明度サポートの場合 true
 */
export const supportsTransparency = (format: string): boolean => {
  const transparentFormats = ['png', 'webp', 'avif', 'gif', 'svg'];
  return transparentFormats.includes(format.toLowerCase());
};

